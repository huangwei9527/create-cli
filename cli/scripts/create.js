import fs from "fs-extra";
import shell from "shelljs";
import chalk from "chalk";
import path from "path";
import logSymbols from "log-symbols";
import ora from "ora";
import {
	removeDir,
	changePackageJson,
	createDir,
	resolveApp,
	unzipZipFile,
	__dirnameTemplates,
} from "./utils.js";
import { templates, messages } from "./constants.js";
import {
	inquirerConfirm,
	inquirerChoose,
	inquirerInputs,
} from "./interactive.js";
import childProcess from 'child_process';
/**
 * 创建项目方法
 * @param {*} appName 项目名称
 * @param {*} option 配置项
 */
export default async function create(appName, option) {
	// 验证appName输入是否符合规范
	if (appName.match(/[\u4E00-\u9FFF`~!@#$%&^*[\]()\\;:<.>/?]/g)) {
		console.log(
			logSymbols.error,
			chalk.redBright("Error：<app-name>存在非法字符！")
		);
		return;
	}

	let repository = "";

	// 验证是否使用了--template配置项
	if (option.template) {
		// 从模板列表中找到目标templaet，如果不存在则抛出异常
		const template = templates.find(
			(template) => template.name === option.template
		);
		if (!template) {
			console.log(
				logSymbols.warning,
				`不存在模板${chalk.yellowBright(option.template)}`
			);
			console.log(
				`\r\n运行 ${chalk.cyanBright("my-cli ls")} 查看所有可用模板\r\n`
			);
			return;
		}
		repository = template.value;
	} else {
		// 从模板列表中选择
		const answer = await inquirerChoose("请选择项目模板：", templates);
		repository = answer.choose;
	}

	// 验证是否存在appName同名文件夹
	if (fs.existsSync(appName)) {
		if (option.force) {
			// 存在force配置项，直接覆盖
			await removeDir(appName);
		} else {
			// 不存在force配置项，询问是否覆盖
			const answer = await inquirerConfirm(
				`已存在同名文件夹${appName}, 是否覆盖：`
			);
			if (answer.confirm) {
				await removeDir(appName);
			} else {
				console.log(
					logSymbols.error,
					chalk.redBright(`Error：项目创建失败！存在同名文件夹${appName}`)
				);
				return;
			}
		}
	}

	let answers = {};

	// 验证是否使用了--ignore配置项
	if (!option.ignore) {
		// 没有使用则需要输入项目信息
		answers = await inquirerInputs(messages);
	}

	const spinner = ora("\n").start();
	spinner.text = "创建项目文件...";
	// 拉取模板
	try {
		createDir(appName);
		await unzipZipFile(
			path.resolve(__dirnameTemplates, repository +'.zip'),
			resolveApp(appName)
		);
    	spinner.text = "已创建项目文件";
		spinner.succeed();
		spinner.stop();
	} catch (err) {
		spinner.text = "项目文件创建失败";
		spinner.error();
		spinner.stop();
		console.log(err);
		shell.exit(1);
	}

	// 最后更新package.json
	if (answers.name || answers.description) {
		await changePackageJson(appName, answers);
	}
	const spinner2 = ora("\n").start();
	let count = 0
	const dotMap = {
		0: '.',
		1: '..',
		2: '...'
	}
	const inte = setInterval(() => { 
		spinner2.text = "正在安装依赖" + dotMap[count];
		count = (count + 1)%3
	}, 1000)

	//获取 子进程模块的exec方法,用于执行cmd命令
	childProcess.exec('npm install', { cwd: path.resolve(process.cwd(), appName) }, function (err, stdout, stderr) {
		if (err) { return console.log('依赖安装失败：' + err); }
		spinner2.succeed();
		spinner2.stop();		
		clearInterval(inte)
		console.log(logSymbols.success, "依赖安装成功！");
		console.log(logSymbols.success, `项目创建成功 ！`);
	});
	
}
