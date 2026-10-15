const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { Tree } = require("@angular-devkit/schematics");
const { SchematicTestRunner } = require("@angular-devkit/schematics/testing");

const schematicsPath = path.resolve(__dirname, "../../dist/lib/schematics");

test("the built ng-add collection can run in an Angular application", async () => {
  const runner = new SchematicTestRunner("local-storage", path.join(schematicsPath, "collection.json"));
  const tree = Tree.empty();
  tree.create("/package.json", JSON.stringify({
    dependencies: { "@angular/core": "^22.0.0", rxjs: "^7.8.2" },
  }));

  await runner.runSchematic("ng-add", {}, tree);

  assert.equal(runner.tasks[0].name, "node-package");
});

test("the built migration collection can load and run", async () => {
  const runner = new SchematicTestRunner("local-storage-migrations", path.join(schematicsPath, "migration.json"));
  const tree = Tree.empty();
  tree.create("/package.json", JSON.stringify({ dependencies: { rxjs: "^7.8.2" } }));

  const result = await runner.runSchematic("migration-v15", {}, tree);

  assert.equal(result.readContent("/package.json"), tree.read("/package.json").toString());
});
