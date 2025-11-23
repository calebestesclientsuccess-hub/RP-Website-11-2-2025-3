const filenames = [
  "AdminDashboard-DId3paKx.js",
  "AdminSidebar-CO_bb2gd.js",
  "AIPromptSettings-CdQgiWIm.js",
  "index-C0S-uj5C.css",
  "vendor-CIGMepfB.js"
];

const OLD_REGEX = /\.[a-f0-9]{8,}\./i;
// Trying to replicate what the user might have tried or a robust one
const NEW_REGEX_CANDIDATE = /[-.][a-zA-Z0-9_-]{8}\.(?:js|css)$/;

console.log("--- Testing OLD_REGEX ---");
filenames.forEach(f => {
  console.log(`${f}: ${OLD_REGEX.test(f)}`);
});

console.log("\n--- Testing NEW_REGEX_CANDIDATE ---");
filenames.forEach(f => {
  console.log(`${f}: ${NEW_REGEX_CANDIDATE.test(f)}`);
});
