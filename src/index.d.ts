declare namespace PackageOptions {
  interface ParamOptions {
    alias: string;
    default: any;
    type: 'number' | 'string' | 'boolean';
  }

  interface HelpOptions {
    autoShow: boolean;
    paddingBottom: number;
    paddingLeft: number;
    paddingTop: number;
  }

  interface Config {
    name: string;
    params: object;
    inferTypes: boolean;
    projectPath: string;
  }

  interface PackageOptions<T = object> {
    [param: string]: any;

    new(data?: object, selfOptions?: Partial<Config>): this;
    boolean(parameters: string[] | string): this;
    class(): new(data?: object, selfOptions?: Partial<Config>) => this;
    clone(): this;
    config(values?: Partial<Config>): Config;
    get(option: string, defaultValue?: any): any;
    getHelpText(): string;
    getProjectPath(): string | undefined;
    help(helpText: string, options?: Partial<HelpOptions>): this;
    load(object: Partial<T>): this;
    loadCmd(args?: string[] | string): this;
    loadDefaults(packagePrefix?: string): this;
    loadEnv(prefix?: string, envValues?: object): this;
    loadEnv(keys?: string[], envValues?: object): this;
    loadFile(fileName: string, section?: string): this;
    param(name: string, options: Partial<ParamOptions>): this;
    reset(): this;
    set(name: string, value: any): this;
    toJSON(): T;
  }
}

declare const PackageOptions: PackageOptions.PackageOptions & {
  default: PackageOptions.PackageOptions;
};

export = PackageOptions;
