import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cwd } from "node:process";
import { Logger } from "euberlog";
import ts from "typescript";
import { parse } from "@jupiterone/query-language-parser";

const logger = new Logger();

const validateExports = () => {
  const indexFiles = readdirSync(resolve(cwd(), "rule-packs"));

  const indexPath = resolve(cwd(), "rule-packs", "index.js");

  const file = ts.preProcessFile(readFileSync(indexPath, "utf-8"), true, true);

  const importedFiles = file.importedFiles.map((f) =>
    f.fileName.replace("./", "")
  );

  for (const indexFile of indexFiles) {
    if (indexFile === "index.js" || importedFiles.includes(indexFile)) {
      continue;
    }
    throw new Error(`File ${indexFile} is not imported in index.js.`);
  }

  for (const importedFile of importedFiles) {
    if (indexFiles.includes(importedFile)) {
      continue;
    }
    throw new Error(`File ${importedFile} does not exist`);
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
  if (rule.labels) {
    if (!Array.isArray(rule.labels)) {
      throw new Error(
        `Rule ${rule.name} has an invalid labels property. Labels must be an array.`
      );
    }

    const labelNameMap = {};

    for (const label of rule.labels) {
      if (!label.labelName || !label.labelValue) {
        throw new Error(
          `Rule ${rule.name} has an invalid label. "${label}" must include a labelName property and labelValue property.`
        );
      }
      const normalizedLabelName = label.labelName.trim().toLowerCase();
      if (labelNameMap[normalizedLabelName]) {
        throw new Error(
          `Rule ${rule.name} has invalid labels. Duplicate label names are not allowed on a rule`
        );
      }
      labelNameMap[normalizedLabelName] = true;
    }
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
