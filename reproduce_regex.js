const filenames = [
  "AdminDashboard-DId3paKx.js",
  "AdminSidebar-CO_bb2gd.js",
  "AIPromptSettings-CdQgiWIm.js",
  "index-C0S-uj5C.css",
  "vendor-CIGMepfB.js"
];

const OLD_REGEX = /\.[a-f0-9]{8,}\./i;
// Candidate regex: allow hyphen or dot before hash, alphanumeric+dash+underscore hash (8+ chars), then extension
const NEW_REGEX_CANDIDATE = /[-.][a-zA-Z0-9_-]{8,}\.(js|css)$/;

console.log("--- Testing OLD_REGEX ---");
filenames.forEach(f => {
  const matched = OLD_REGEX.test(f);
  console.log(`${f}: ${matched}`);
});

console.log("\n--- Testing NEW_REGEX_CANDIDATE ---");
filenames.forEach(f => {
  const matched = NEW_REGEX_CANDIDATE.test(f);
  console.log(`${f}: ${matched}`);
});
