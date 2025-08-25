/**
 * buildContainer.js
 *
 * Step through the process of downloading and setting up our default developer
 * code install.
 */
const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

const Repos = {
   /* repo name  :  directory name */
   ab_platform_web: "ab_platform_web",
   ab_service_api_sails: "api_sails",
   ab_service_db: "db",
   ab_service_appbuilder: "appbuilder",
   ab_service_bot_manager: "bot_manager",
   ab_service_custom_reports: "custom_reports",
   ab_service_definition_manager: "definition_manager",
   ab_service_file_processor: "file_processor",
   ab_service_log_manager: "log_manager",
   ab_migration_manager: "migration_manager",
   ab_service_notification_email: "notification_email",
   ab_service_process_manager: "process_manager",
   ab_service_relay: "relay",
   ab_service_tenant_manager: "tenant_manager",
   ab_service_user_manager: "user_manager",
   ab_service_web: "web",
};

function gitInstall(rootDir, gitURL, dirName) {
   process.chdir(rootDir);

   console.log("    git clone ");
   shell.exec(`git clone --recursive ${gitURL} ${dirName}`, {
      silent,
   });

   shell.pushd("-q", path.join(rootDir, dirName));
   shell.mkdir("-p", "node_modules");

   // We now use master branches
   // console.log("    git checkout");
   // shell.exec("git checkout develop", { silent });

   console.log("    git submodule update");
   shell.exec("git submodule update --init --recursive", {
      silent,
   });

   if (gitURL.indexOf("ab_service_db") == -1) {
      console.log("    npm install");
      shell.exec("npm install --force", {
         silent,
      });

      // if there is an AppBuilder submodule then npm install that as well
      const checkScript =
         require(path.join(process.cwd(), "package.json")).scripts
            .submoduleNPMInstall ?? null;

      if (checkScript) {
         console.log("    npm submodule install");
         shell.exec("npm run submoduleNPMInstall", {
            silent,
         });
      }
   }

   shell.popd("-q");
}

async function initService(list) {
   if (list.length == 0) {
      return;
   }
   var pos = list.length;

   // for each link then try to clone a repository
   var repoName = list.shift();
   let dirName = Repos[repoName];

   var gitURL = `https://github.com/digi-serve/${repoName}.git`;

   console.log(`... [${pos}] processing ${repoName} `);

   gitInstall(devDir, gitURL, dirName);

   await initService(list);
}

async function installPlugins(list) {
   if (list.length == 0) {
      return;
   }
   var pos = list.length;
   var plugin = list.shift();

   console.log(`... [${pos}] plugin ${plugin}`);

   const repoName = `plugin_${plugin}`;
   const gitURL = `https://github.com/digi-serve/${repoName}.git`;

   gitInstall(pluginDir, gitURL, plugin);

   await installPlugins(list);
}
appbuilder_platform_pwa
async function installPWA() {
   console.log(`... appbuilder_platform_pwa`);
   const gitURL = `https://github.com/CruGlobal/appbuilder_platform_pwa.git`;
   gitInstall(devDir, gitURL, "appbuilder_platform_pwa");
}
/*
 * in a development container, existing .gz files in the assets will
 * conflict with the new files being developed.
 */
async function cleanGZ() {
   shell.pushd("-q", path.join(devDir, "web", "assets"));
   shell.exec("rm *.gz", { silent });
   shell.popd("-q");
}

async function run() {
   try {
      await initService(allServices);
      await installPWA();
      await installPlugins(allPlugins););
      await cleanGZ();
      console.log();
      console.log("... done");
      process.chdir(cwd);
   } catch (err) {
      console.log();
      console.error(err);
      process.chdir(cwd);
      // process.exit();
   }
}

// make sure developer directory exists
var devDir = path.join(process.cwd(), "developer");
try {
   fs.accessSync(devDir);
} catch (e) {
   // if it doesn't, create it
   if (e.code == "ENOENT") {
      shell.mkdir(devDir);
   }
}

var pluginDir = path.join(devDir, "plugins");
try {
   fs.accessSync(pluginDir);
} catch (e) {
   // if it doesn't, create it
   if (e.code == "ENOENT") {
      shell.mkdir(pluginDir);
   }
}

var silent = true;

var allServices = Object.keys(Repos);
var cwd = process.cwd();

var allPlugins = ["ABDesigner"];
run();
