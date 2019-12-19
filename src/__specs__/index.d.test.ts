import options, { PackageOptions } from '../index';

class Options {
  a: string = '';

  constructor(options: typeof PackageOptions) {
    Object.assign(this, options.toJSON());
  }
}

options.load({ a: 1 });
options.a = 2;

new Options(options);

const helpOptions: options.HelpOptions;
