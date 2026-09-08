# Zoom Clone

## Assumptions

- The Join input accepts personal link names as text, but the backend keys meetings on numeric IDs only — there is no `personal_link_name` column — so a pure link name will not resolve and the Join button stays disabled for it. Numeric IDs, spaced IDs, and pasted `/j/{id}` invite URLs all work.
