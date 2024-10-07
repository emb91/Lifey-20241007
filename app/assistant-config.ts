// export let assistantId = "asst_lGNE35SaQ9aCAJQclsePnj5X";
// // set your assistant ID here
// 
// if (assistantId === "") {
//   assistantId = process.env.OPENAI_ASSISTANT_ID;
// }

export const assistantId = process.env.OPENAI_ASSISTANT_ID || "asst_lGNE35SaQ9aCAJQclsePnj5X";

if (!assistantId) {
  throw new Error("Assistant ID is not set. Please provide a valid assistant ID.");
}

