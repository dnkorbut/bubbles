(() => {
    const R = 20
    const FRICTION = 0.95
    const MOUSEMAX = R * 5

    const ZERO = 0.000001
    const Rx2 = R * 2

    const cnv = document.createElement('canvas')
    const ctx = cnv.getContext('2d')

    const w = window.innerWidth
    const h = window.innerHeight

    cnv.width = w
    cnv.height = h

    document.body.style.margin = 0
    document.body.appendChild(cnv)

    const Px2 = Math.PI * 2

    const circles = []

    for (let i = R * 1.0; i < w - R; i += R * 1) {
        const ic = i * 256 / w
        for (let j = R * 1.0; j < h - R; j += R * 1) {
            const jc = j * 256 / h
            const ijc = (i + j) * 256 / w
            circles.push({
                r: Math.random() * R,
                x: i,
                y: j,
                s: { x: 0, y: 0 },
                c: "rgba(" + jc / 5 + ', ' + ijc + ', ' + ic + ', ' + 0.06 + ')'
            })
        }
    }

    // circles.push({
    //   r: R,
    //   x: 100,
    //   y: 100,
    //   s: { x: 0, y: 0 },
    //   c: '#ff0000'
    // })
    // circles.push({
    //   r: R,
    //   x: 500,
    //   y: 100,
    //   s: { x: -0, y: 0 },
    //   c: '#0000ff'
    // })

    function distance(v1, v2) {
        return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2))
    }

    function sub(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y }
    }

    function add(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y }
    }

    function mul(v, n) {
        return { x: v.x * n, y: v.y * n }
    }

    function len(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }

    function normalize(v) {
        const l = len(v)
        if (l === 0) return { x: 0, y: 0 }
        return mul(v, 1 / l)
    }

    function middlepoint(a) {
        const ret = { x: 0, y: 0 }
        const l = a.length + 1
        for (const c of a) {
            ret.x += c.x
            ret.y += c.y
        }

        return { x: ret.x / l, y: ret.y / l }
    }

    function physics() {
        // clear forces
        for (const c of circles) {
            c.forces = []
        }

        // collisions
        for (let i = 0; i < circles.length; i++) {
            const ci = circles[i]
            for (let j = i + 1; j < circles.length; j++) {
                const cj = circles[j]

                const d = distance(ci, cj)
                if (d < Rx2 - ZERO) {
                    ci.forces.push(mul(normalize(sub(ci, cj)), Rx2 - d))
                    cj.forces.push(mul(normalize(sub(cj, ci)), Rx2 - d))
                }
            }
        }

        // boundary collisions
        for (const c of circles) {
            if (c.x < R) {
                c.forces.push({ x: Math.abs(R - c.x), y: 0 })
            }
            if (c.x > w - R) {
                c.forces.push({ x: -Math.abs(w - R - c.x), y: 0 })
            }
            if (c.y < R) {
                c.forces.push({ x: 0, y: Math.abs(R - c.y) })
            }
            if (c.y > h - R) {
                c.forces.push({ x: 0, y: -Math.abs(h - R - c.y) })
            }
        }


        for (const c of circles) {
            c.s.x *= FRICTION
            c.s.y *= FRICTION

            const mp = middlepoint(c.forces)
            c.s.x += mp.x
            c.s.y += mp.y

            c.x += c.s.x
            c.y += c.s.y
        }
    }

    function loop() {
        physics()

        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, w, h)
        for (const c of circles) {
            ctx.fillStyle = c.c
            ctx.beginPath()
            ctx.arc(c.x, c.y, c.r / 1.2, 0, Px2)
            ctx.closePath()
            ctx.fill()
        }
        requestAnimationFrame(loop)
    }
    loop()

    let mouse = { x: 0, y: 0 }
    cnv.onmousemove = function (e) {
        if (e.buttons === 0) return
        const pos = { x: e.offsetX, y: e.offsetY }
        const delta = normalize(sub(pos, mouse))
        mouse = pos
        for (const c of circles) {
            const d = distance(c, pos)
            if (d < MOUSEMAX) {
                c.s.x += delta.x
                c.s.y += delta.y
            }
        }
    }
})()
