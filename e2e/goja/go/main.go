package main

import (
	"fmt"
	"io"
	"os"
	"time"

	"github.com/dop251/goja"
)

const executionTimeout = 2 * time.Second

type timeoutSignal struct{}

func main() {
	if err := run(); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "goja compatibility check failed: %v\n", err)
		os.Exit(1)
	}

	_, _ = fmt.Fprintln(os.Stdout, "ok")
}

func run() error {
	script, err := io.ReadAll(os.Stdin)
	if err != nil {
		return fmt.Errorf("read bundled script from stdin: %w", err)
	}

	if len(script) == 0 {
		return fmt.Errorf("received empty script")
	}

	runtime := goja.New()
	var reportedOK bool

	if err := runtime.Set("__goja_report_ok__", func() {
		reportedOK = true
	}); err != nil {
		return fmt.Errorf("register ok reporter: %w", err)
	}

	timer := time.AfterFunc(executionTimeout, func() {
		runtime.Interrupt(timeoutSignal{})
	})
	defer timer.Stop()

	if _, err := runtime.RunString(string(script)); err != nil {
		if interrupted, ok := err.(*goja.InterruptedError); ok {
			if _, isTimeout := interrupted.Value().(timeoutSignal); isTimeout {
				return fmt.Errorf("execution timed out after %s", executionTimeout)
			}
		}

		return fmt.Errorf("execute bundled script: %w", err)
	}

	if !reportedOK {
		return fmt.Errorf("script finished without reporting ok")
	}

	return nil
}
