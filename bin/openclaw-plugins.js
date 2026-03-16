#!/usr/bin/env node

/**
 * OpenClaw插件管理器 - CLI入口
 */

const { program } = require('commander');
const chalk = require('chalk');
const PluginManager = require('../src/index');

// 创建插件管理器实例
const pluginManager = new PluginManager();

// 设置程序信息
program
  .name('openclaw-plugins')
  .description('OpenClaw插件管理器 - 发现、安装和管理插件')
  .version('0.1.0');

// 列出推荐插件
program
  .command('list')
  .description('列出推荐插件')
  .option('-a, --all', '显示所有插件')
  .option('-c, --category <category>', '按类别筛选')
  .option('-s, --source <source>', '指定插件源')
  .action(async (options) => {
    try {
      await pluginManager.listPlugins(options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 搜索插件
program
  .command('search <query>')
  .description('搜索插件')
  .option('-c, --category <category>', '按类别筛选')
  .option('-l, --limit <number>', '限制结果数量', '10')
  .action(async (query, options) => {
    try {
      await pluginManager.searchPlugins(query, options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 安装插件
program
  .command('install <plugins...>')
  .description('安装插件')
  .option('-y, --yes', '跳过确认提示')
  .option('-c, --configure', '安装后自动配置')
  .option('-f, --force', '强制安装（覆盖现有）')
  .action(async (plugins, options) => {
    try {
      await pluginManager.installPlugins(plugins, options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 安装必备插件套件
program
  .command('install-essential')
  .description('安装必备插件套件')
  .option('-y, --yes', '跳过确认提示')
  .action(async (options) => {
    try {
      await pluginManager.installEssentialSuite(options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 查看已安装插件
program
  .command('installed')
  .description('查看已安装插件')
  .option('-u, --updates', '检查更新')
  .action(async (options) => {
    try {
      await pluginManager.listInstalledPlugins(options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 更新插件
program
  .command('update [plugins...]')
  .description('更新插件')
  .option('-a, --all', '更新所有插件')
  .option('-y, --yes', '跳过确认提示')
  .action(async (plugins, options) => {
    try {
      await pluginManager.updatePlugins(plugins, options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 卸载插件
program
  .command('uninstall <plugins...>')
  .description('卸载插件')
  .option('-y, --yes', '跳过确认提示')
  .option('-c, --clean', '清理配置文件')
  .action(async (plugins, options) => {
    try {
      await pluginManager.uninstallPlugins(plugins, options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 插件信息
program
  .command('info <plugin>')
  .description('查看插件详细信息')
  .action(async (plugin) => {
    try {
      await pluginManager.showPluginInfo(plugin);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 配置插件
program
  .command('configure <plugin>')
  .description('配置插件')
  .option('-i, --interactive', '交互式配置')
  .action(async (plugin, options) => {
    try {
      await pluginManager.configurePlugin(plugin, options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 诊断问题
program
  .command('diagnose')
  .description('诊断插件问题')
  .action(async () => {
    try {
      await pluginManager.diagnose();
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 清理缓存
program
  .command('cleanup')
  .description('清理插件缓存')
  .action(async () => {
    try {
      await pluginManager.cleanup();
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 备份配置
program
  .command('backup')
  .description('备份插件配置')
  .option('-o, --output <file>', '输出文件路径')
  .action(async (options) => {
    try {
      await pluginManager.backupConfig(options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 恢复配置
program
  .command('restore')
  .description('恢复插件配置')
  .requiredOption('-f, --file <file>', '备份文件路径')
  .action(async (options) => {
    try {
      await pluginManager.restoreConfig(options);
    } catch (error) {
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log('\n' + chalk.cyan('示例:'));
  console.log('  $ openclaw-plugins list');
  console.log('  $ openclaw-plugins install feishu-doc');
  console.log('  $ openclaw-plugins install-essential');
  console.log('  $ openclaw-plugins update --all');
}

// 解析命令行参数
program.parse(process.argv);