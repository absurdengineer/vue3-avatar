`never-resolves.png` is intentionally absent.

The skeleton tests point `imageSrc` at this path so the browser issues a real
request that fails, leaving the avatar in its loading state for the capture. A
file that actually loaded would defeat the test.
