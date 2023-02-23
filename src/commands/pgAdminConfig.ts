const prompts = require("prompts");
import { PluginInstance } from "..//PluginInstance";

interface IQuestion {
  type: string;
  name: string;
  message: string;
  initial: string | boolean;
  validate: (value: string) => boolean
}

export const defaultConfig = {
  username: "admin@gluestack.com",
  password: "password",
  scriptName: "pgadmin"
};

const getNewInstanceQuestions = (): IQuestion[] => {
  return [
    {
      type: "text",
      name: "PGADMIN_DEFAULT_EMAIL",
      message: "What would be your PG Admin's username?",
      initial: defaultConfig.username,
      validate: (value: string) => (value.length > 0) ? true : false
    },
    {
      type: "text",
      name: "PGADMIN_DEFAULT_PASSWORD",
      message: "What would be your PG Admin's password?",
      initial: defaultConfig.password,
      validate: (value: string) => (value.length > 0) ? true : false
    },
    {
      type: "text",
      name: "SCRIPT_NAME",
      message: "What would be your PG Admin's URI?",
      initial: defaultConfig.scriptName,
      validate: (value: string) => (value.length > 0) ? true : false
    }
  ];
};

export const writeInstance = async (pluginInstance: PluginInstance) => {
  const response = await prompts(getNewInstanceQuestions());

  // trim the values in an object
  Object.keys(response).forEach(key =>
    response[key] = response[key].trim()
  );

  pluginInstance.gluePluginStore.set("pgadmin_config", response);
};
