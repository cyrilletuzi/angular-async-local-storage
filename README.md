# Warning

This quickstart is under active development and hasn't yet reached its final form.

It may not be fully compatible with current versions of Angular.

# Angular QuickStart Lib
[![Build Status][travis-badge]][travis-badge-url]

This is a simple library quickstart for Angular libraries, implementing the
[Angular Package Format v4.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit#heading=h.k0mh3o8u5hx).

Currently only unscoped, primary entry-point libraries are supported.

Features:
- a simple example library
- unit tests for the library
- a demo application that consumes the library in JIT mode and runs in watch mode
- an integration app that consumes the library in JIT and AOT mode and runs e2e tests

Common tasks are present as npm scripts:

- `npm start` to run a live-reload server with the demo app
- `npm run test` to test in watch mode, or `npm run test:once` to only run once
- `npm run build` to build the library
- `npm run lint` to lint 
- `npm run clean` to clean
- `npm run integration` to run the integration e2e tests
- `npm install ./relative/path/to/lib` after `npm run build` to test locally in another app

If you need to debug the integration app, please check `./integration/README.md`.

[travis-badge]: https://travis-ci.org/filipesilva/angular-quickstart-lib.svg?branch=master
[travis-badge-url]: https://travis-ci.org/filipesilva/angular-quickstart-lib

## The QuickStart Library seed

This example repository has an implemention of the described package format but is by no means
the only way you should publish a library.

Any setup that builds the necessary package format works just as well for a consumer.
You are encouraged to customize this process as you see fit.

When developing your own setup, keep in mind that even though [AOT](#appendix-supporting-aot)
is preferred, [Just-in-time](#appendix-supporting-jit) compilation should be supported.

Make sure you have at least Node 6.9 and NPM 3.0 installed.
Then ...

1. Create a project folder (you can call it `quickstart-lib` and rename it later).
1. [Clone](#clone "Clone it from github") or [download](#download "download it from github") the **QuickStart Library seed** into your project folder.
1. Install npm packages.
1. Run `npm start` to launch the sample application.


### Clone

Perform the _clone-to-launch_ steps with these terminal commands.

```
git clone https://github.com/filipesilva/angular-quickstart-lib.git
cd angular-quickstart-lib
npm install
npm start
```


### Download
[Download the QuickStart Library seed](https://github.com/filipesilva/angular-quickstart-lib/archive/master.zip)
and unzip it into your project folder. Then perform the remaining steps with these terminal commands.

```
cd angular-quickstart-lib
npm install
npm start
```


## Initialize your repository

If you cloned the package from github, it has a `.git` folder where the official repository's history lives.

You don't want that git history though - you'll want to make your own. 

Delete this folder and initialize this one as a new repository:

```
rm -rf .git # Linux or OS/X (bash)
rd .git /S/Q # Windows
git init
```

**Warning**: Do this only in the beginning to avoid accidentally deleting your own git setup!



## What's in the QuickStart Library seed?

The **QuickStart Library seed** contains a similar structure to the [Quickstart seed](https://github.com/angular/quickstart).
It's modified to build and test a library instead of an application.

Consequently, there are _many different files_ in the project.
Focus on the following TypeScript (`.ts`) files in the **`/src`** folder.

```
src/
├── demo/
|  └── app/
|     ├── app.component.ts
|     └── app.module.ts
└── lib/
   ├── index.ts
   └── src/
      ├── component/
      |  └── lib.component.ts
      ├── service/
      |  └── lib.service.ts
      └── module.ts

```

Each file has a distinct purpose and evolves independently as the application grows.

Files outside `src/` concern building, deploying, and testing your app.
They include configuration files and external dependencies.

Files inside `src/lib/` "belong" to your library, while `src/demo/` contains a demo application
that loads your library.

Libraries do not run by themselves, so it's very useful to have this "demo" app while developing 
to see how your library would look like to consumers.

When you run `npm start`, the demo application is served.

The following are all in `src/`

<table width="100%">
  <col width="20%">
  </col>
  <col width="80%">
  </col>
  <tr>
    <th>
      File
    </th>
    <th>
      Purpose
    </th>
  </tr>
  <tr>
    <td>
      <code>demo/app/app.component.ts</code>
    </td>
    <td>
      A demo component that renders the library component and a value from the library service.
    </td>
  </tr>
  <tr>
    <td>
      <code>demo/app/app.module.ts</code>
    </td>
    <td>
      A demo <code>NgModule</code> that imports the Library <code>LibModule</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/component/app.component.ts</code>
    </td>
    <td>
      A sample library component that renders an <code>h2</code> tag.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/service/lib.service.ts</code>
    </td>
    <td>
      A sample library service that exports a value.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/module.ts</code>
    </td>
    <td>
      The library's main <code>NgModule</code>, <code>LibModule</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/index.ts</code>
    </td>
    <td>
      The public API of your library, where you choose what to export to consumers.
    </td>
  </tr>
</table>


## The build step

You can build the library by running `npm run build`. 
This will generate a `dist/` directory with all the entry points described above.

All the logic for creating the build can be found in `./build.js`. It consists of roughly 5 steps:

- Compile with the AOT Compiler (AOT compiler or `ngc`) for ES5 and ES2015.
- Inline html and css inside the generated JavaScript files.
- Copy typings, metatada, html and css.
- Create each bundle using Rollup.
- Copy `LICENSE`, `package.json` and `README.md` files


## Testing libraries

While testing is always important, it's **especially** important in libraries because consumer
applications might break due to bugs in libraries.

But the fact that a library is consumed by another application is also what makes it hard to test.

To properly test a library, you need to have an integration tests.
An integration test is to libraries what an end-to-end test is to applications.
It tests how an app would install and use your library.

The **QuickStart Library seed** includes a directory called `integration` containing a standalone
app that consumes your built library in both AOT and JIT modes, with end-to-end tests to verify
it works.

To run the integration tests, do `npm run integration` which does the following:
- Build your library.
- Enter the integration app's directory.
- Install dependencies.
- Build the app in AOT mode.
- Test the app in AOT mode.
- Test the app in JIT mode.

Running integration tests gives you greater confidence that your library is properly built.

In addition to integration tests, you can also run unit tests in watch mode via `npm run test`,
or single-run via `npm run test:once`.

You can also test your library by installing it in another local repository you have. 
To do so, first build your lib via `npm run build`.
Then install it from your other repo using a relative path to the dist folder: 
`npm install relative/path/to/library/dist`.


## Publishing your library

Every package on NPM has a unique name, and so should yours. 
If you haven't already, now is the time to change the name of your library.

Use your editor to search the project for all instances of `quickstart-lib` and change it
to your intended name (also in `dash-case` format).
The library name is mentioned on at least these files: 

- `integration/src/app/app.component.ts`
- `integration/src/app/app.module.ts`
- `integration/src/systemjs.config.js`
- `integrations/package.json`
- `src/demo/app/app.component.ts`
- `src/demo/app/app.module.ts`
- `src/demo/systemjs.config.js`
- `src/demo/tsconfig.json`
- `src/lib/tsconfig.es5.json`
- `src/lib/tsconfig.lib.json`
- `bs-config.json`
- `package.json`
- `README.md`

You'll also need to rename the folder your project is in.

After you have changed the package name, you can publish it to NPM (read 
[this link](https://docs.npmjs.com/getting-started/publishing-npm-packages) for details).

Instead of following the `Updating the package` on that previous doc, here we use
[standard-version](https://github.com/conventional-changelog/standard-version).
Read their docs to see how to use it.

First you'll need to create a NPM account and login on your local machine.
Then you can publish your package by running `npm publish dist/`.  
Since your package is built on the `dist/` folder this is the one you should publish.


<div class="l-sub-section">

### Be a good library maintainer

Now that you've published a library, you need to maintain it as well. 
Below are some of the most important points:

- Document your library.
- Keep an eye on the issue tracker.
- [Manage your dependencies properly](#appendix-dependency-management)
- Follow [Semantic Versioning](http://semver.org/)
- Setup a Continuous Integration solution to test your library (included is a `.travis.yml` 
file for [Travis CI](https://docs.travis-ci.com/user/getting-started/))!
- Choose an [appropriate license](https://choosealicense.com/).

</div>


## Appendix: Supporting AOT

AOT plays an important role in optimizing Angular applications. 
It's therefore important that third party libraries be published in a format compatible with AOT
compilation.
Otherwise it will not be possible to include the library in an AOT compiled application.

Only code written in TypeScript can be AOT compiled.
 
Before publishing the library must first be compiled using the AOT compiler (`ngc`). 
`ngc` extends the `tsc` compiler by adding extensions to support AOT compilation in addition to
regular TypeScript compilation.   

AOT compilation outputs three files that must be included in order to be compatible with AOT.

*Transpiled JavaScript*

As usual the original TypeScript is transpiled to regular JavaScript.

*Typings files*

JavaScript has no way of representing typings. 
In order to preserve the original typings, `ngc` will generate `.d.ts` typings files.

*Meta Data JSON files*

`ngc` outputs a metadata.json file for every `Component` and `NgModule`.
These meta data files represent the information in the original `NgModule` and `Component`
decorators.   

The meta data may reference external templates or css files.
These external files must be included with the library.

### NgFactories

`ngc` generates a series of files with an `.ngfactory` suffix as well.
These files represent the AOT compiled source, but should not be included with the published library.

Instead the `ngc` compiler in the consuming application will generate `.ngfactory` files based
on the JavaScript, Typings and meta data shipped with the library. 

### Why not publish TypeScript?

Why not ship TypeScript source instead? 
After all the library will be part of another TypeScript compilation step when the library is
imported by the consuming application.

Generally it's discouraged to ship TypeScript with third party libraries. 
It would require the consumer to replicate the complete build environment of the library. 
Not only typings, but potentially a specific version of `ngc` as well.

Publishing plain JavaScript with typings and meta data allows the consuming application to 
remain agnostic of the library's build environment.


## Appendix: Supporting JIT

AOT compiled code is the preferred format for production builds, but due to the long compilation
time it may not be practical to use AOT during development.

To create a more flexible developer experience a JIT compatible build of the library should be
published as well. 
The format of the JIT bundle is `umd`, which stands for Universal Module Definition.
Shipping the bundle as `umd` ensures compatibility with most common module loading formats.

The `umd` bundle will ship as a single file containing ES5 JavaScript and inlined versions of 
any external templates or css. 


## Appendix: Dependency Management

As a library maintainer, it's important to properly manage your dependencies in `package.json`.

There are [three kinds of dependencies](https://docs.npmjs.com/files/package.json#dependencies):
 `dependencies`, `devDependencies` and `peerDependencies`.

- `dependencies`: here go all the other libraries yours depends on when being used.
A good way to figure out these is to go through your library source code (in `src/lib` **only**)
and list all the libraries there.
- `devDependencies`: libraries that you need while developing, testing and building your library
go here.
When a user installs your library, these won't be installed. 
Users don't need to develop, build or test your library, they just need to run it.
- `peerDependencies`: these are similar to `dependencies` since your library expects them to be
there at runtime.
The difference is that you don't want to install a new version of these, but instead use
the one already available. 

A good example of a peer dependency is `@angular/core` and all other main Angular libraries.
If you listed these in `dependencies`, a new one - with a different version! - could be installed
for your library to use.
This isn't what you wanted though. You want your library to use *the exact same* `@angular/core`
that the app is using.

You'll usually used `@angular/*` libraries listed in both `devDependencies` and 
`peerDependencies`.
This is normal and expected, because when you're developing your library also need a copy of
them installed.

Another thing to remember is to keep your dependencies from changing too much unexpectedly.
Different versions of libraries can have different features, and if you inadvertently are too
lenient with allowed versions your library might stop working because a dependency changed.

You can choose what versions you allow by using [ranges](https://docs.npmjs.com/misc/semver).

A good rule of thumb is to have all `dependencies` specified with a tilde `~`(`~1.2.3`),
while your `peerDependencies` have a range (`"@angular/core": ">=4.0.0 <5.0.0 || >=4.0.0-beta <5.0.0"`).

Any extra dependency or peer dependency that you add to `package.json` should also be added
to the `globals` and `external` array in the `rollupBaseConfig` variable in `./build.js`.

This ensures your library doesn't package extra libraries inside of it and instead uses the ones
available in the consuming app.
