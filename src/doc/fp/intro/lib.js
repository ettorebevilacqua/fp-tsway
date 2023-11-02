
const tryCatch =(f)=>val=>{

    try {
      return f(val)
    } catch(e){log('error in try', e)}
  }