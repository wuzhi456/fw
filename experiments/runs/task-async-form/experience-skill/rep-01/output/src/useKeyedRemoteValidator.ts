import { useEffect, useRef, useState } from "react";
import type { RemoteFieldState } from "./types";
import { mockValidateEmail, mockValidateUsername } from "./mockRemoteApi";

type Field = "username" | "email";

function initial(): RemoteFieldState {
  return { status: "pristine" };
}

/**
 * Remote validation bound to a field key: each in-flight request is aborted
 * on dependency change or unmount so stale responses never apply.
 */
export function useKeyedRemoteValidator(
  field: Field,
  value: string,
  shouldRun: boolean,
): RemoteFieldState {
  const [state, setState] = useState<RemoteFieldState>(initial);
  const generation = useRef(0);

  useEffect(() => {
    if (!shouldRun) {
      setState(initial());
      return;
    }

    const myGen = ++generation.current;
    const controller = new AbortController();
    setState({ status: "pending" });

    void (async () => {
      try {
        const res =
          field === "username"
            ? await mockValidateUsername(value, controller.signal)
            : await mockValidateEmail(value, controller.signal);
        if (controller.signal.aborted) return;
        if (myGen !== generation.current) return;
        setState(
          res.valid
            ? { status: "valid" }
            : { status: "invalid", message: res.message },
        );
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (controller.signal.aborted) return;
        if (myGen !== generation.current) return;
        setState({
          status: "invalid",
          message: "Validation failed unexpectedly",
        });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [field, value, shouldRun]);

  return state;
}
