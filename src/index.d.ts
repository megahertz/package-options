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

  export interface Config {
    name: string;
    params: object;
    inferTypes: boolean;
    projectPath: string;
  }

  export interface PackageOptions<T = object> {
    [param: string]: any;

    new(data?: object, selfOptions?: Partial<Config>): this;
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

    default: PackageOptions;
    PackageOptions: new(
      data?: object,
      selfOptions?: Partial<Config>,
    ) => PackageOptions;
  }
}

declare const PackageOptions: PackageOptions.PackageOptions & {
  PackageOptions: PackageOptions.PackageOptions;
};

export = PackageOptions;
