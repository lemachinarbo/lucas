# Fix

1. When an error such as 'no text available' is returned, it is being logged in the user's history.
2. Language selector
3. Add an option to export JSON history with a user token.
4. Add option to use OPEN AI token

# Plan

## Phase 1: Simple Test (MVP)
- Use the Buddhist emotions dataset JSON as the primary source.
- Modify Lucas’s prompt to pull relevant passages based on detected emotions.
- Ensure responses integrate emotional insights and redirections.

## Phase 2: Smarter Retrieval
- Use a basic search (keyword matching) to fetch relevant texts.
- Inject those into the prompt dynamically.

## Phase 3: Vector-Based Search (RAG)
- Embed the texts into vectors.
- Store and retrieve the most relevant ones based on user input.
