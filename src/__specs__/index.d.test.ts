import options, { HelpOptions, PackageOptions } from '../index';

class Options {
  a: string = '';

  constructor(options: PackageOptions) {
    Object.assign(this, options.toJSON());
  }
}

options.load({ a: 1 });
options.a = 2;

new Options(options);

let helpOptions: HelpOptions;
