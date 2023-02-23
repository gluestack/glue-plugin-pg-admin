import { writeFile } from "@gluestack/helpers";
import { PluginInstance } from "../PluginInstance";

export async function constructEnvFromJson(instance: PluginInstance) {
  const keys: any = {
    ...await instance.getContainerController().getEnv()
  };

  return keys;
}

export async function writeEnv(instance: PluginInstance) {
  const path = `${instance.getInstallationPath()}/.env`;
  let env = "";
  const keys: any = await constructEnvFromJson(instance);
  Object.keys(keys).forEach((key) => {
    env += `${key}="${keys[key]}"
`;
  });

  await writeFile(path, env);
}
