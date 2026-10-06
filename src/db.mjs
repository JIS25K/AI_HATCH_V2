export function database(binding) {
  const statement=(query,args=[])=>binding.prepare(query).bind(...args);
  return {
    one:async(query,...args)=>await statement(query,args).first(),
    all:async(query,...args)=>(await statement(query,args).all()).results,
    run:async(query,...args)=>await statement(query,args).run(),
    batch:async rows=>await binding.batch(rows.map(([query,...args])=>statement(query,args)))
  };
}
