# Optimistic updates (state-optimistic-rollback)

**N/A for this task.**

This form does not apply optimistic UI for the mutation: the UI stays in an explicit **idle / submitting / error / success** state until the server responds. There is no provisional “success” state to roll back on failure.

If this flow were extended (e.g. instant list updates after submit), we would snapshot prior rows, patch locally, and reconcile or revert on failure using the server response or a refetch.
