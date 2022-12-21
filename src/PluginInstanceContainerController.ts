const { DockerodeHelper } = require("@gluestack/helpers");
import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";

export class PluginInstanceContainerController implements IContainerController {
  app: IApp;
  status: "up" | "down" = "down";
  portNumber: number;
  containerId: string;
  dockerfile: string;
  callerInstance: IInstance;

  constructor(app: IApp, callerInstance: IInstance) {
    this.app = app;
    this.callerInstance = callerInstance;
    this.setStatus(this.callerInstance.gluePluginStore.get("status"));
    this.setPortNumber(this.callerInstance.gluePluginStore.get("port_number"));
    this.setContainerId(
      this.callerInstance.gluePluginStore.get("container_id"),
    );
  }

  getCallerInstance(): IInstance {
    return this.callerInstance;
  }

  getEnv() {
    let pg_config = {
      email: "admin@gluestack.app",
      password: "password",
    };

    if (!this.callerInstance.gluePluginStore.get("pg_config") || !this.callerInstance.gluePluginStore.get("pg_config").email)
      this.callerInstance.gluePluginStore.set("pg_config", pg_config);

    pg_config = this.callerInstance.gluePluginStore.get("pg_config");

    return {
      PGADMIN_DEFAULT_EMAIL: pg_config.email,
      PGADMIN_DEFAULT_PASSWORD: pg_config.password,
    };
  }

  getDockerJson() {
    return {
      Image: "dpage/pgadmin4",
      HostConfig: {
        PortBindings: {
          "80/tcp": [
            {
              HostPort: this.getPortNumber(true).toString(),
            },
          ],
        },
      },
      ExposedPorts: {
        "80/tcp": {},
      }
    };
  }


  getStatus(): "up" | "down" {
    return this.status;
  }

  getPortNumber(returnDefault?: boolean): number {
    if (this.portNumber) {
      return this.portNumber;
    }
    if (returnDefault) {
      return 5050;
    }
  }

  getContainerId(): string {
    return this.containerId;
  }

  setStatus(status: "up" | "down") {
    this.callerInstance.gluePluginStore.set("status", status || "down");
    return (this.status = status || "down");
  }

  setPortNumber(portNumber: number) {
    this.callerInstance.gluePluginStore.set("port_number", portNumber || null);
    return (this.portNumber = portNumber || null);
  }

  setContainerId(containerId: string) {
    this.callerInstance.gluePluginStore.set(
      "container_id",
      containerId || null,
    );
    return (this.containerId = containerId || null);
  }

  setDockerfile(dockerfile: string) {
    this.callerInstance.gluePluginStore.set("dockerfile", dockerfile || null);
    return (this.dockerfile = dockerfile || null);
  }

  getConfig(): any { }

  async up() {
    let ports =
      this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];

    await new Promise(async (resolve, reject) => {
      DockerodeHelper.getPort(this.getPortNumber(true), ports)
        .then((port: number) => {
          this.portNumber = port;
          DockerodeHelper.up(
            this.getDockerJson(),
            this.getEnv(),
            this.portNumber,
            this.callerInstance.getName(),
          )
            .then(
              ({
                status,
                portNumber,
                containerId,
              }: {
                status: "up" | "down";
                portNumber: number;
                containerId: string;
                dockerfile: string;
              }) => {
                DockerodeHelper.generateDockerFile(this.getDockerJson(),
                  this.getEnv(),
                  this.callerInstance.getName())
                this.setStatus(status);
                this.setPortNumber(portNumber);
                this.setContainerId(containerId);
                ports.push(portNumber);
                this.callerInstance.callerPlugin.gluePluginStore.set(
                  "ports",
                  ports,
                );
                console.log("\x1b[32m");
                console.log(`Open http://localhost:${this.getPortNumber()}/ in browser`);
                console.log();
                console.log(`Credentials to login in pgAdmin: `);
                console.log(`email: ${this.getEnv().PGADMIN_DEFAULT_EMAIL}`);
                console.log(`password: ${this.getEnv().PGADMIN_DEFAULT_PASSWORD}`);
                console.log("\x1b[0m")
                console.log();
                return resolve(true);
              },
            )
            .catch((e: any) => {
              return reject(e);
            });
        })
        .catch((e: any) => {
          return reject(e);
        });
    });
  }

  async down() {
    let ports =
      this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
    await new Promise(async (resolve, reject) => {
      DockerodeHelper.down(this.getContainerId(), this.callerInstance.getName())
        .then(() => {
          this.setStatus("down");
          var index = ports.indexOf(this.getPortNumber());
          if (index !== -1) {
            ports.splice(index, 1);
          }
          this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);

          this.setPortNumber(null);
          this.setContainerId(null);
          return resolve(true);
        })
        .catch((e: any) => {
          return reject(e);
        });
    });
  }

  async build() { }
}
