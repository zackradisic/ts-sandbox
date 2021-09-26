mod utils;

use anyhow::{Context, Error};
use std::sync::Arc;
use swc::{config::Options, try_with_handler, Compiler};
use swc_common::{sync::Lazy, FileName, FilePathMapping, SourceMap};
use utils::set_panic_hook;

use wasm_bindgen::prelude::*;

fn convert_err(err: Error) -> JsValue {
    format!("{:?}", err).into()
}

#[wasm_bindgen]
pub fn transpile(src: &str, output_config: &JsValue) -> Result<JsValue, JsValue> {
    set_panic_hook();
    let c = compiler();
    match try_with_handler(c.cm.clone(), |handler| {
        let opts: Options = output_config
            .into_serde()
            .with_context(|| "failed to deserialize output config")?;

        let fm = c.cm.new_source_file(FileName::Anon, src.into());
        let p = c
            .parse_js(
                fm,
                handler,
                opts.config.jsc.target.unwrap_or_default(),
                opts.config.jsc.syntax.unwrap_or_default(),
                opts.is_module,
                false,
            )
            .with_context(|| "failed to parse Program")?;

        c.process_js(handler, p, &opts)
            .with_context(|| "failed to process js")
    })
    .map_err(convert_err)
    {
        Err(e) => Err(e),
        Ok(output) => Ok(output.code.into()),
    }
}

/// Get global sourcemap
fn compiler() -> Arc<Compiler> {
    static C: Lazy<Arc<Compiler>> = Lazy::new(|| {
        let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));

        Arc::new(Compiler::new(cm))
    });

    C.clone()
}
