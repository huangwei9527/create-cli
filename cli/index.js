#! /usr/bin/env node
import fs from "fs-extra";
import figlet from "figlet";
import chalk from "chalk";
import { table } from "table";
import { program } from "commander";
import create from "./scripts/create.js";
import { templates } from "./scripts/constants.js";

// 读取package.json配置信息
const pkg = fs.readJsonSync(new URL("../package.json", import.meta.url));

// 查看版本号
program.version(pkg.version, "-v, --version");

// 创建项目命令
program
  .command("create <app-name>")
  .description("创建一个新的项目")
  .action(create);

// 查看模板列表
program
  .command("ls")
  .description("查看所有可用的模板")
  .action(() => {
    const data = templates.map((item) => [
      chalk.greenBright(item.name),
      chalk.white(item.desc),
    ]);
    data.unshift([chalk.white("模板名称"), chalk.white("模板描述")]);
    console.log(table(data));
  });

// 配置脚手架基本信息
program
  .name("hw-create-cli")
  .description("前端团队工程脚手架")
  .usage("<command> [options]")
  // 用在内置的帮助信息之后输出自定义的额外信息
  .on("--help", () => {
    console.log(
      "\r\n" +
        chalk.greenBright.bold(
          figlet.textSync("hw-create-cli", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 100,
            whitespaceBreak: true,
          })
        )
    );
    console.log(
      `\r\n Run ${chalk.cyanBright(
        `hw-create-cli <command> --help`
      )} for detailed usage of given command.`
    );
  });

program.parse(process.argv);
