export const calcElapsedTime = (s:Date, e:Date): string => {
    let d = (e.getTime() - s.getTime())
    let st = d / 1000
    let u = 's'
    switch (true) {
      case d >= (1000 * 60):
        st = (d / (1000 *  60))
        u = 'm'
        break;
      case d >= (1000 * 60 * 60):
        st = (d / (1000 *  60 * 60))
        u = 'h'
        break;
      case d >= (1000 * 60 * 60 * 24):
        st = (d / (1000 *  60 * 60 * 24))
        u = 'd'
        break;
    }
    return `${st.toFixed(2)}${u}`
  }