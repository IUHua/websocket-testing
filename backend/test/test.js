// dataManager.js

const fs = require('fs/promises')
const path = require('path')

// 数据库文件夹的路径
const dataDirPath = path.join(__dirname, './database')
// 主索引文件的路径
const mainFilePath = path.join(dataDirPath, 'data.json')

/**
 * 内部辅助函数：确保数据库目录存在
 */
async function ensureDbDirectory() {
    try {
        await fs.access(dataDirPath)
    } catch (error) {
        // 目录不存在，创建它
        await fs.mkdir(dataDirPath)
    }
}

/**
 * 内部辅助函数：读取并解析主索引文件 data.json
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function readMainFile() {
    await ensureDbDirectory()
    try {
        const fileContent = await fs.readFile(mainFilePath, 'utf8')
        return JSON.parse(fileContent)
    } catch (error) {
        // 如果文件不存在或为空，返回一个空数组
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return []
        }
        throw error // 其他错误则抛出
    }
}

/**
 * 内部辅助函数：将数据写入主索引文件 data.json
 * @param {Array<{id: number, name: string}>} data
 */
async function writeMainFile(data) {
    await ensureDbDirectory()
    await fs.writeFile(mainFilePath, JSON.stringify(data, null, 2), 'utf8')
}

/**
 * ====================================================================
 * CRUD 函数
 * ====================================================================
 */

/**
 * [Create] 创建一个新的数据条目
 * @param {string} name - 新条目的名称 (必须唯一)
 * @param {object} details - 新条目的详细信息对象
 * @returns {Promise<object>} 创建成功后的完整对象
 */
async function createItem(name, details = {}) {
    const allItems = await readMainFile()

    // 检查name是否已存在
    if (allItems.some((item) => item.name === name)) {
        throw new Error(`名称为 "${name}" 的条目已存在。`)
    }

    // 生成新的 ID (当前最大ID + 1)
    const newId =
        allItems.length > 0
            ? Math.max(...allItems.map((item) => item.id)) + 1
            : 1

    // 创建新的索引对象和详细信息对象
    const newItemSummary = { id: newId, name }
    const newItemDetails = { id: newId, name, ...details }

    // 更新索引文件
    allItems.push(newItemSummary)
    await writeMainFile(allItems)

    // 创建详细信息文件
    const detailFilePath = path.join(dataDirPath, `${newId}.json`)
    await fs.writeFile(
        detailFilePath,
        JSON.stringify(newItemDetails, null, 2),
        'utf8'
    )

    console.log(`✅ 条目创建成功: ID=${newId}, Name=${name}`)
    return newItemDetails
}

/**
 * [Read] 获取所有条目的摘要列表
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function getAllItems() {
    console.log('🔍 正在获取所有条目列表...')
    return await readMainFile()
}

/**
 * [Read] 根据 ID 获取单个条目的详细信息
 * @param {number} id - 要获取的条目ID
 * @returns {Promise<object|null>} 返回找到的条目对象，如果未找到则返回 null
 */
async function getItemById(id) {
    const detailFilePath = path.join(dataDirPath, `${id}.json`)
    try {
        const fileContent = await fs.readFile(detailFilePath, 'utf8')
        console.log(`🔍 成功找到并读取 ID=${id} 的条目。`)
        return JSON.parse(fileContent)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`⚠️ 未找到 ID=${id} 的条目。`)
            return null // 文件不存在说明条目不存在
        }
        throw error // 其他错误则抛出
    }
}

/**
 * [Update] 根据 ID 更新一个条目
 * @param {number} id - 要更新的条目ID
 * @param {object} updates - 包含要更新的字段的对象 (例如 { name: "新名称", price: 150 })
 * @returns {Promise<object|null>} 返回更新后的完整对象，如果未找到则返回 null
 */
async function updateItem(id, updates) {
    const allItems = await readMainFile()
    const itemIndex = allItems.findIndex((item) => item.id === id)

    if (itemIndex === -1) {
        console.warn(`⚠️ 更新失败：未在索引中找到 ID=${id} 的条目。`)
        return null
    }

    // 如果更新中包含name，并且新的name与其他条目冲突，则抛出错误
    if (
        updates.name &&
        allItems.some((item) => item.name === updates.name && item.id !== id)
    ) {
        throw new Error(`更新失败：名称 "${updates.name}" 已被其他条目使用。`)
    }

    // 读取当前的详细信息
    const currentDetails = await getItemById(id)
    if (!currentDetails) {
        console.warn(
            `⚠️ 更新失败：虽然在索引中找到 ID=${id}，但找不到其详细文件。`
        )
        return null
    }

    // 合并更新
    const updatedDetails = { ...currentDetails, ...updates }

    // 如果名称被更新，则同时更新索引文件中的名称
    if (updates.name && updates.name !== allItems[itemIndex].name) {
        allItems[itemIndex].name = updates.name
        await writeMainFile(allItems)
    }

    // 写入更新后的详细信息文件
    const detailFilePath = path.join(dataDirPath, `${id}.json`)
    await fs.writeFile(
        detailFilePath,
        JSON.stringify(updatedDetails, null, 2),
        'utf8'
    )

    console.log(`🔄 条目 ID=${id} 更新成功。`)
    return updatedDetails
}

/**
 * [Delete] 根据 ID 删除一个条目
 * @param {number} id - 要删除的条目ID
 * @returns {Promise<boolean>} 如果删除成功返回 true, 否则返回 false
 */
async function deleteItem(id) {
    let allItems = await readMainFile()
    const itemExists = allItems.some((item) => item.id === id)

    if (!itemExists) {
        console.warn(`⚠️ 删除失败：未找到 ID=${id} 的条目。`)
        return false
    }

    // 从索引数组中过滤掉要删除的条目
    const updatedItems = allItems.filter((item) => item.id !== id)
    await writeMainFile(updatedItems)

    // 删除对应的详细信息文件
    const detailFilePath = path.join(dataDirPath, `${id}.json`)
    try {
        await fs.unlink(detailFilePath)
        console.log(`🗑️ 条目 ID=${id} 已成功删除。`)
        return true
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(
                `⚠️ 索引中的条目已删除，但 ID=${id} 的详细文件本就不存在。`
            )
            return true // 目标是删除，文件不存在也算达成目标
        }
        console.error(`❌ 删除 ID=${id} 的详细文件时出错:`, error)
        // 此时索引已更新，但文件删除失败，可能需要手动干预
        // 可以选择把索引加回去，但这会让逻辑更复杂。这里我们选择报告错误。
        throw error
    }
}

// 导出所有函数，以便在其他文件中使用
module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
}

/**
 * ====================================================================
 * 使用示例
 * ====================================================================
 * 您可以直接运行 `node dataManager.js` 来查看效果
 */
;(async () => {
    // 检查是否是通过 `node dataManager.js` 直接运行的
    if (require.main === module) {
        console.log('--- 开始执行CRUD操作演示 ---')

        try {
            // 1. 创建几个新条目
            // await createItem("笔记本电脑", {
            //     price: 8999,
            //     brand: "Apple",
            //     model: "MacBook Pro",
            // });
            // await createItem("无线鼠标", { price: 299, brand: "Logitech" });
            // // 2. 获取所有条目列表
            // const all = await getAllItems();
            // console.log("所有条目列表:", all);
            // // 3. 获取 ID=1 的条目详情
            // const item1 = await getItemById(1);
            // console.log("ID=1的详情:", item1);
            // // 4. 更新 ID=2 的条目
            // await updateItem(2, { price: 321239, inStock: true });
            // const updatedItem2 = await getItemById(2);
            // console.log("更新后的ID=2详情:", updatedItem2);
            // // 5. 更新名称
            // await updateItem(2, { name: "苹果笔记本电脑" });
            // // 6. 删除 ID=1 的条目
            // await deleteItem(1);
            // // 7. 再次查看所有条目
            // const finalAll = await getAllItems();
            // console.log("删除后的所有条目列表:", finalAll);
            // 8. 尝试创建一个重名的条目 (会报错)
            // await createItem('无线鼠标', { price: 199, brand: 'Razer' });
        } catch (error) {
            console.error('\n--- 操作中发生错误 ---')
            console.error(error.message)
        } finally {
            console.log('\n--- 演示执行完毕 ---')
        }
    }
})()
