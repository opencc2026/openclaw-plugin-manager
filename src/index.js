    }
    
    // 更新插件
    for (const pluginId of pluginsToUpdate) {
      const spinner = ora(`更新插件 ${pluginId}...`).start();
      
      try {
        // 备份当前配置
        const pluginDir = path.join(this.config.pluginsDir, pluginId);
        const backupDir = path.join(this.config.pluginsDir, 'backups', pluginId, new Date().toISOString().replace(/[:.]/g, '-'));
        
        if (await fs.pathExists(pluginDir)) {
          await fs.copy(pluginDir, backupDir);
        }
        
        // 重新安装插件（模拟更新）
        await this.installSinglePlugin(pluginId, { force: true });
        
        spinner.succeed(`插件 ${pluginId} 更新成功`);
      } catch (error) {
        spinner.fail(`更新插件 ${pluginId} 失败`);
        this.logger.error('更新错误:', error);
      }
    }
    
    console.log(chalk.green.bold('\n✅ 插件更新完成！'));
  }
  
  /**
   * 卸载插件
   */
  async uninstallPlugins(pluginIds, options = {}) {
    await this.initialize();
    
    const { yes = false, clean = false } = options;
    
    // 确认卸载
    if (!yes) {
      console.log(chalk.bold.red(`\n🗑️  准备卸载以下插件:`));
      pluginIds.forEach(id => {
        const plugin = this.getInstalledPlugin(id);
        console.log(`  - ${plugin?.name || id}`);
      });
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确认卸载？此操作不可恢复',
          default: false
        }
      ]);
      
      if (!confirm) {
        console.log(chalk.yellow('卸载已取消'));
        return;
      }
    }
    
    // 卸载每个插件
    for (const pluginId of pluginIds) {
      await this.uninstallSinglePlugin(pluginId, clean);
    }
    
    console.log(chalk.green.bold('\n✅ 插件卸载完成！'));
  }
  
  /**
   * 卸载单个插件
   */
  async uninstallSinglePlugin(pluginId, clean = false) {
    const spinner = ora(`卸载插件 ${pluginId}...`).start();
    
    try {
      const pluginDir = path.join(this.config.pluginsDir, pluginId);
      
      // 检查是否已安装
      if (!await fs.pathExists(pluginDir)) {
        spinner.warn(`插件 ${pluginId} 未安装`);
        return;
      }
      
      // 创建备份
      const backupDir = path.join(this.config.pluginsDir, 'backups', 'uninstalled', pluginId, new Date().toISOString().replace(/[:.]/g, '-'));
      await fs.copy(pluginDir, backupDir);
      
      // 删除插件目录
      await fs.remove(pluginDir);
      
      // 清理配置文件
      if (clean) {
        const configFile = path.join(this.config.configDir, `${pluginId}.yaml`);
        if (await fs.pathExists(configFile)) {
          await fs.remove(configFile);
        }
      }
      
      spinner.succeed(`插件 ${pluginId} 卸载成功`);
    } catch (error) {
      spinner.fail(`卸载插件 ${pluginId} 失败`);
      throw error;
    }
  }
  
  /**
   * 显示插件信息
   */
  async showPluginInfo(pluginId) {
    await this.initialize();
    
    const plugin = this.pluginsCache.plugins.find(p => p.id === pluginId);
    if (!plugin) {
      console.log(chalk.red(`找不到插件: ${pluginId}`));
      return;
    }
    
    const installed = this.getInstalledPlugin(pluginId);
    
    console.log(chalk.bold.cyan(`\n📋 插件信息: ${plugin.name}\n`));
    
    console.log(chalk.bold('基本信息:'));
    console.log(`  ${chalk.blue('ID:')} ${plugin.id}`);
    console.log(`  ${chalk.blue('名称:')} ${plugin.name}`);
    console.log(`  ${chalk.blue('版本:')} ${plugin.version}`);
    console.log(`  ${chalk.blue('描述:')} ${plugin.description}`);
    console.log(`  ${chalk.blue('源:')} ${plugin.source} (${plugin.sourceDescription})`);
    
    if (plugin.author) {
      console.log(`  ${chalk.blue('作者:')} ${plugin.author}`);
    }
    
    if (plugin.homepage) {
      console.log(`  ${chalk.blue('主页:')} ${plugin.homepage}`);
    }
    
    console.log(`\n${chalk.bold('安装状态:')}`);
    if (installed) {
      console.log(`  ${chalk.green('✓ 已安装')}`);
      console.log(`  ${chalk.blue('安装版本:')} ${installed.version}`);
      console.log(`  ${chalk.blue('安装时间:')} ${new Date(installed.installedAt).toLocaleString()}`);
      
      const hasUpdate = semver.gt(plugin.version, installed.version);
      if (hasUpdate) {
        console.log(`  ${chalk.yellow('有更新可用:')} ${installed.version} → ${plugin.version}`);
      }
    } else {
      console.log(`  ${chalk.gray('○ 未安装')}`);
    }
    
    if (plugin.categories && plugin.categories.length > 0) {
      console.log(`\n${chalk.bold('类别:')}`);
      plugin.categories.forEach(cat => console.log(`  - ${cat}`));
    }
    
    if (plugin.keywords && plugin.keywords.length > 0) {
      console.log(`\n${chalk.bold('关键词:')}`);
      console.log(`  ${plugin.keywords.join(', ')}`);
    }
    
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      console.log(`\n${chalk.bold('依赖:')}`);
      plugin.dependencies.forEach(dep => console.log(`  - ${dep}`));
    }
    
    if (plugin.installation) {
      console.log(`\n${chalk.bold('安装说明:')}`);
      console.log(`  ${plugin.installation}`);
    }
    
    console.log(`\n${chalk.bold('命令:')}`);
    if (installed) {
      console.log(`  ${chalk.cyan('openclaw-plugins update')} ${pluginId}    # 更新插件`);
      console.log(`  ${chalk.cyan('openclaw-plugins uninstall')} ${pluginId}  # 卸载插件`);
      console.log(`  ${chalk.cyan('openclaw-plugins configure')} ${pluginId} # 配置插件`);
    } else {
      console.log(`  ${chalk.cyan('openclaw-plugins install')} ${pluginId}   # 安装插件`);
    }
  }
  
  /**
   * 配置插件
   */
  async configurePlugin(pluginId, options = {}) {
    await this.initialize();
    
    const { interactive = false } = options;
    
    // 检查插件是否已安装
    if (!this.isPluginInstalled(pluginId)) {
      console.log(chalk.red(`插件 ${pluginId} 未安装，请先安装`));
      return;
    }
    
    const plugin = this.pluginsCache.plugins.find(p => p.id === pluginId);
    const configFile = path.join(this.config.configDir, `${pluginId}.yaml`);
    
    console.log(chalk.bold.cyan(`\n⚙️  配置插件: ${plugin?.name || pluginId}\n`));
    
    if (interactive && plugin?.configGuide) {
      // 交互式配置
      const answers = await inquirer.prompt(plugin.configGuide.questions);
      
      // 生成配置
      const config = {};
      plugin.configGuide.mapping.forEach(mapping => {
        config[mapping.key] = answers[mapping.question];
      });
      
      // 保存配置
      await fs.writeFile(configFile, yaml.stringify(config));
      console.log(chalk.green(`✅ 配置已保存到: ${configFile}`));
      
    } else {
      // 显示配置信息
      if (await fs.pathExists(configFile)) {
        const configContent = await fs.readFile(configFile, 'utf8');
        console.log(chalk.bold('当前配置:'));
        console.log(configContent);
        
        console.log(chalk.cyan('\n编辑配置文件:'));
        console.log(`  ${chalk.gray('$')} nano ${configFile}`);
      } else if (plugin?.configTemplate) {
        console.log(chalk.yellow('尚未配置此插件'));
        console.log(chalk.cyan('\n创建配置文件:'));
        console.log(`  ${chalk.gray('$')} cp ${path.join(this.config.pluginsDir, pluginId, 'config.example.yaml')} ${configFile}`);
        console.log(`  ${chalk.gray('$')} nano ${configFile}`);
      } else {
        console.log(chalk.gray('此插件无需特殊配置'));
      }
    }
  }
  
  /**
   * 诊断插件问题
   */
  async diagnose() {
    await this.initialize();
    
    console.log(chalk.bold.cyan('\n🔍 OpenClaw插件诊断\n'));
    
    const issues = [];
    
    // 检查插件目录
    if (!await fs.pathExists(this.config.pluginsDir)) {
      issues.push({
        level: 'error',
        message: '插件目录不存在',
        fix: `mkdir -p ${this.config.pluginsDir}`
      });
    }
    
    // 检查配置目录
    if (!await fs.pathExists(this.config.configDir)) {
      issues.push({
        level: 'warning',
        message: '配置目录不存在',
        fix: `mkdir -p ${this.config.configDir}`
      });
    }
    
    // 检查已安装插件
    const installedPlugins = await this.getInstalledPlugins();
    
    installedPlugins.forEach(plugin => {
      const pluginInfo = this.pluginsCache.plugins.find(p => p.id === plugin.id);
      
      if (!pluginInfo) {
        issues.push({
          level: 'warning',
          message: `插件 ${plugin.id} 不在插件源中`,
          fix: `openclaw-plugins uninstall ${plugin.id}`
        });
      } else if (semver.gt(pluginInfo.version, plugin.version)) {
        issues.push({
          level: 'info',
          message: `插件 ${plugin.id} 有更新可用`,
          fix: `openclaw-plugins update ${plugin.id}`
        });
      }
    });
    
    // 显示诊断结果
    if (issues.length === 0) {
      console.log(chalk.green('✅ 未发现问题，所有插件运行正常'));
    } else {
      const errorCount = issues.filter(i => i.level === 'error').length;
      const warningCount = issues.filter(i => i.level === 'warning').length;
      const infoCount = issues.filter(i => i.level === 'info').length;
      
      console.log(chalk.bold(`发现 ${issues.length} 个问题:`));
      console.log(`  ${chalk.red('错误:')} ${errorCount}  ${chalk.yellow('警告:')} ${warningCount}  ${chalk.blue('信息:')} ${infoCount}\n`);
      
      issues.forEach((issue, index) => {
        const prefix = issue.level === 'error' ? chalk.red('✗') :
                      issue.level === 'warning' ? chalk.yellow('⚠') :
                      chalk.blue('ℹ');
        
        console.log(`${prefix} ${issue.message}`);
        if (issue.fix) {
          console.log(`   ${chalk.gray('修复:')} ${issue.fix}`);
        }
        console.log();
      });
    }
    
    console.log(chalk.cyan('\n诊断完成'));
  }
  
  /**
   * 清理缓存
   */
  async cleanup() {
    await this.initialize();
    
    const spinner = ora('清理插件缓存...').start();
    
    try {
      const cacheDir = path.join(this.config.pluginsDir, 'cache');
      const backupDir = path.join(this.config.pluginsDir, 'backups');
      
      // 清理缓存
      if (await fs.pathExists(cacheDir)) {
        await fs.remove(cacheDir);
        await fs.ensureDir(cacheDir);
      }
      
      // 清理旧备份（保留最近7天）
      if (await fs.pathExists(backupDir)) {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        const backupItems = await fs.readdir(backupDir);
        for (const item of backupItems) {
          const itemPath = path.join(backupDir, item);
          const stats = await fs.stat(itemPath);
          
          if (stats.mtimeMs < oneWeekAgo) {
            await fs.remove(itemPath);
          }
        }
      }
      
      spinner.succeed('缓存清理完成');
    } catch (error) {
      spinner.fail('缓存清理失败');
      throw error;
    }
  }
  
  /**
   * 备份配置
   */
  async backupConfig(options = {}) {
    await this.initialize();
    
    const outputFile = options.output || `openclaw-plugins-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    const spinner = ora('备份插件配置...').start();
    
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        plugins: await this.getInstalledPlugins(),
        configs: {}
      };
      
      // 备份配置文件
      const configFiles = glob.sync('*.yaml', { cwd: this.config.configDir });
      for (const file of configFiles) {
        const content = await fs.readFile(path.join(this.config.configDir, file), 'utf8');
        backupData.configs[file] = content;
      }
      
      // 保存备份文件
      await fs.writeJson(outputFile, backupData, { spaces: 2 });
      
      spinner.succeed(`配置已备份到: ${outputFile}`);
    } catch (error) {
      spinner.fail('备份配置失败');
      throw error;
    }
  }
  
  /**
   * 恢复配置
   */
  async restoreConfig(options) {
    await this.initialize();
    
    const { file } = options;
    const spinner = ora('恢复插件配置...').start();
    
    try {
      // 读取备份文件
      const backupData = await fs.readJson(file);
      
      // 检查备份格式
      if (!backupData.plugins || !backupData.timestamp) {
        throw new Error('无效的备份文件格式');
      }
      
      console.log(chalk.gray(`备份时间: ${new Date(backupData.timestamp).toLocaleString()}`));
      console.log(chalk.gray(`包含插件: ${backupData.plugins.length} 个`));
      
      // 恢复插件
      for (const plugin of backupData.plugins) {
        if (!this.isPluginInstalled(plugin.id)) {
          await this.installSinglePlugin(plugin.id);
        }
      }
      
      // 恢复配置文件
      if (backupData.configs) {
        for (const [filename, content] of Object.entries(backupData.configs)) {
          const configFile = path.join(this.config.configDir, filename);
          await fs.writeFile(configFile, content);
        }
      }
      
      spinner.succeed('配置恢复完成');
    } catch (error) {
      spinner.fail('恢复配置失败');
      throw error;
    }
  }
  
  /**
   * 检查插件是否已安装
   */
  isPluginInstalled(pluginId) {
    const pluginDir = path.join(this.config.pluginsDir, pluginId);
    const configFile = path.join(pluginDir, 'plugin.json');
    
    return fs.pathExistsSync(configFile);
  }
  
  /**
   * 获取已安装的插件信息
   */
  async getInstalledPlugins() {
    const plugins = [];
    
    if (!await fs.pathExists(this.config.pluginsDir)) {
      return plugins;
    }
    
    const items = await fs.readdir(this.config.pluginsDir);
    
    for (const item of items) {
      const pluginDir = path.join(this.config.pluginsDir, item);
      const configFile = path.join(pluginDir, 'plugin.json');
      
      if (await fs.pathExists(configFile)) {
        try {
          const pluginConfig = await fs.readJson(configFile);
          plugins.push(pluginConfig);
        } catch (error) {
          // 忽略损坏的配置文件
        }
      }
    }
    
    return plugins;
  }
  
  /**
   * 获取单个已安装插件的信息
   */
  getInstalledPlugin(pluginId) {
    const pluginDir = path.join(this.config.pluginsDir, pluginId);
    const configFile = path.join(pluginDir, 'plugin.json');
    
    if (fs.pathExistsSync(configFile)) {
      try {
        return require(configFile);
      } catch (error) {
        return null;
      }
    }
    
    return null;
  }
}

module.exports = OpenClawPluginManager;