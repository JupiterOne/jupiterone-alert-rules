import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cwd } from "node:process";
import { Logger } from "euberlog";
import ts from "typescript";
import { parse } from "@jupiterone/query-language-parser";

const logger = new Logger();

const validateExports = () => {
  const files = readdirSync(resolve(cwd(), "rule-packs"));

  const indexPath = resolve(cwd(), "rule-packs", "index.js");

  const file = ts.preProcessFile(readFileSync(indexPath, "utf-8"), true, true);

  const importedFiles = file.importedFiles.map((f) =>
    f.fileName.replace("./", "")
  );

  for (const file of files) {
    if (file === "index.js" || importedFiles.includes(file)) {
      continue;
    }
    throw new Error(`File ${file} is not imported in index.js.`);
  }
};

const validateJsonContent = () => {
  const files = readdirSync(resolve(cwd(), "rule-packs")).filter(
    (file) => file !== "index.js"
  );
  for (const file of files) {
    const rulePack = require(resolve(cwd(), "rule-packs", file));
    if (!(rulePack instanceof Array)) {
      throw new Error(`File ${file} does not export an array.`);
    }
    for (const rule of rulePack) {
      validateRule(rule);
    }
  }
};

const validateRule = (rule) => {
  if (
    !["MEDIUM", "HIGH", "LOW", "INFO", "CRITICAL", undefined].includes(
      rule.alertLevel
    )
  ) {
    throw new Error(
      `Rule ${rule.name} has an invalid alertLevel. ${rule.alertLevel} is not a valid alertLevel.`
    );
  }
  for (const queryObj of rule.queries) {
    if (RegExp(/[^A-Za-z0-9_]/g).test(queryObj.name)) {
      throw new Error(
        `Rule ${rule.name} has an invalid query name. "${queryObj.name}" is not a valid query name.`
      );
    }
    try {
      parse(queryObj.query);
    } catch (e) {
      throw new Error(
        `Rule ${rule.name} has an invalid query. ${queryObj.name} is not a valid query.

        ${e.message}
        `
      );
    }
  }
};

try {
  logger.info("Starting validation...");
  logger.info("Validating exports...");
  validateExports();
  logger.info("Validating json contents...");
  validateJsonContent();
  logger.success("Everything valid");
} catch (e) {
  logger.error(e.message);
  process.exit(1);
}
