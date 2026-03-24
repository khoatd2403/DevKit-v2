function handleAutoFix(input) {
  let s = input.trim();
  
  // 1. Convert single quotes to double quotes for strings
  s = s.replace(/'((?:\\.|[^'])*)'/g, (_, g1) => {
    return '"' + g1.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"'
  });

  // 2. Fix unquoted keys (e.g., { key: "value" } -> { "key": "value" })
  s = s.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // 3. Fix trailing commas (e.g., [1, 2, ] -> [1, 2])
  s = s.replace(/,\s*([}\]])/g, '$1');

  // 4. BIG IMPROVEMENT: Fix missing commas between properties on different lines
  // We look for a value (digit, keyword, "string", }, ]) followed by optional whitespace and a newline,
  // then another line starting with a "key": or a key:
  s = s.replace(/([0-9a-zA-Z"}\]])\s*\n\s*(?=["a-zA-Z_$])/g, '$1,\n');

  try {
    JSON.parse(s);
    console.log("SUCCESS");
    console.log(s);
  } catch (e) {
    console.log("FAILED: " + e.message);
    console.log("TRANSFORMED: " + s);
  }
}

console.log("--- TEST 1: Missing Comma After Number ---");
handleAutoFix(`{
  "a": 1
  "b": 2
}`);

console.log("--- TEST 2: Missing Comma After String ---");
handleAutoFix(`{
  "a": "val"
  "b": "val2"
}`);

console.log("--- TEST 3: Mixed Issues ---");
handleAutoFix(`{
  'a': 1
  b: 'val'
  "c": [1, 2,]
}`);

console.log("--- TEST 4: The User Reported Case ---");
handleAutoFix(`{
  "name": "Antigravity"
  "purpose": "Assistant"
  "age": 1
}`);
