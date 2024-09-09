import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import logSymbols from "log-symbols";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import zlib from "zlib";
import AdmZip from "adm-zip";

export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __dirnameTemplates = path.resolve(__dirname, "../../templates");

export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);


// 创建文件夹
export function createDir(dir) {
	return fs.mkdirSync(resolveApp(dir));
}

// 删除文件夹
export async function removeDir(dir) {
	try {
		await fs.remove(resolveApp(dir));
		console.log(logSymbols.warning, `已覆盖同名文件夹${dir}`);
	} catch (err) {
		console.log(err);
		return;
	}
}

// 修改package.json配置
export async function changePackageJson(name, info) {
	try {
		if (!fs.existsSync(resolveApp(`${name}/package.json`))) {
			return;
		}
		const pkg = await fs.readJson(resolveApp(`${name}/package.json`));
		Object.keys(info).forEach((item) => {
			if (info[item] && info[item].trim()) {
				pkg[item] = info[item];
			}
		});
		await fs.writeJson(resolveApp(`${name}/package.json`), pkg, { spaces: 2 });
	} catch (err) {
		console.log(err);
		console.log(
			logSymbols.warning,
			chalk.yellow("更新项目信息失败,请手动修改package.json")
		);
	}
}



export async function unzipZipFile(zipFilePath, destination) {
	// 读取zip文件
	const zipData = fs.readFileSync(zipFilePath);

	// 解压缩zip文件
	const unzipper = new AdmZip(zipData);
	unzipper.extractAllTo(destination, /*overwrite*/ true);
}