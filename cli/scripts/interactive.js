import inquirer from "inquirer";
// 封装命令行交互的相关方法

/**
 * @param {string} message 询问提示语句
 * @returns {Object} 根据name属性获取用户输入的值{confirm: y/n}
 */
export const inquirerConfirm = async (message) => {
	const answer = await inquirer.prompt({
		type: "confirm",
		name: "confirm",
		message,
	});
	return answer;
};

/**
 *
 * @param {string} message 询问提示语句
 * @param {Array} choices 选择模板列表，默认读取对象的name属性
 * @returns {Object} 根据name属性获取用户输入的值{请选择项目模板: xxxxxx}
 */
export const inquirerChoose = async (message, choices) => {
	const answer = await inquirer.prompt({
		type: "list",
		name: "choose",
		message,
		choices,
	});
	return answer;
};

/**
 * @param {Array} messages  询问提示语句数组
 * @returns {Object} 结果对象
 */
export const inquirerInputs = async (messages) => {
	const questions = messages.map((msg) => {
		return {
			name: msg.name,
			type: "input",
			message: msg.message,
		};
	});
	const answers = await inquirer.prompt(questions);
	return answers;
};
