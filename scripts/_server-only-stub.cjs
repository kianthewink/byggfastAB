// The `server-only` package throws unless it is resolved through a bundler
// that picks its "react-server" export. Node has no such condition, so the
// standalone scripts in this folder swap it for this no-op.
module.exports = {};
