import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { ensureFileSync, moveSync } from 'fs-extra/esm';

// 路径
const dirPath = './lib';
const testPath = './test';
const testPendPath = './testPend';

// 存储
const fileData = [];
const libNames = [];
const dirNames = [];

// 自动生成导出和单文件
readdirSync(dirPath).forEach((dir) => {
    dirNames.push(dir);
    const files = readdirSync(resolve(dirPath, dir));
    files.forEach((file) => {
        const stat = statSync(resolve(dirPath, dir, file));
        if (stat.isFile() && file.endsWith('.js')) {
            const fileName = basename(file, '.js');
            const filePath = resolve(dirPath, dir, file);
            const testFilePath = resolve('test', dir, `${fileName}.test.js`);
            libNames.push(`yd_${dir}_${fileName}`);
            fileData.push(
                //
                `export { default as yd_${dir}_${fileName} } from './lib/${dir}/${file}';\r\n`
            );
            // 判断是否有相关标签
            const fileData2 = readFileSync(filePath, { encoding: 'utf8' });
            if (!fileData2.includes('@author')) {
                console.log(`${filePath} 文件缺少 [作者]`);
            }
            if (!fileData2.includes('@category')) {
                console.log(`${filePath} 文件缺少 [分类]`);
            }
            if (!fileData2.includes('@alias')) {
                console.log(`${filePath} 文件缺少 [别名]`);
            }
            // 自动生成测试文件
            ensureFileSync(testFilePath);
            const testFileData = readFileSync(testFilePath, { encoding: 'utf8' });
            if (!testFileData) {
                writeFileSync(
                    testFilePath,
                    `import { describe, it, expect } from 'vitest';
import yd_${dir}_${fileName} from '../../lib/${dir}/${fileName}.js';

describe('yd_${dir}_${fileName}', () => {
    it('默认单测', () => {
        expect(true).toBe(true);
    });
});`
                );
            }
        } else {
            console.log(`${dir}/${file}不是一个函数文件`);
        }
    });
});

// 没有匹配的函数测试用例放到独立文件中
readdirSync(testPath).forEach((dir) => {
    const files = readdirSync(resolve(testPath, dir));
    files.forEach((file) => {
        const fileName = basename(file, '.test.js');
        if (libNames.includes(`yd_${dir}_${fileName}`) === false) {
            moveSync(resolve(testPath, dir, file), resolve(testPendPath, dir, file));
        }
    });
});
writeFileSync('./index.js', fileData.join(''));
writeFileSync('./yidashLibNames.js', `export const yidashLibNames = ${JSON.stringify(libNames)}`);
console.log('数据生成完毕');
