const files = [null, null], names = [], fr = new FileReader(), IN = 0, OUT = 1, AUTOEXEC_KEY = '[autoexec]'
let r, file

function fileAdd() {
    displayAndStoreFileName(IN, this)
    readFile(IN, this.files[0])
}

const fileAdd2 = ev => {
    displayAndStoreFileName(OUT, ev.target)
    readFile(OUT, ev.target.files[0])
}

function goProcess() {
    const map = new Map(), map1 = new Map()
    let section, lastAutoexecLine

    file = files[IN].split('\n')
    file.map((it, idx) => [it.trimStart(), idx])
        .filter(it => !it[0].startsWith('#'))
        .forEach(it => {
            if (it[0].startsWith('[')) {
                map.set(section = it[0].replace(/\s+/g, ''), new Map())
            } else if (it[0].includes('=')) {
                const split = it[0].split(/=(.*)/g)
                map.get(section).set(split[0].trimEnd(), [split[1].trim(), it[1], split[0]])
            } else if (map.has(AUTOEXEC_KEY)) {
                map.get(AUTOEXEC_KEY).set(it[1], it[0].trim())
                lastAutoexecLine = it[1]
            }
        })
    files[OUT].split('\n').map((it, idx) => [it.trimStart(), idx])
        .filter(it => !it[0].startsWith('#'))
        .forEach(it => {
            if (it[0].startsWith('[')) {
                map1.set(section = it[0].replace(/\s+/g, ''), new Map())
            } else if (it[0].includes('=')) {
                const split = it[0].split(/=(.*)/g)
                const split0Clean = split[0].trimEnd()
                const split1Clean = split[1].trim()
                map1.get(section).set(split0Clean, [split1Clean, it[1], split[0]])
                const toCompare = map.get(section).get(split0Clean)
                if (toCompare[0] !== split1Clean) {
                    file[toCompare[1]] = toCompare[2] + '= ' + split1Clean + r
                }
            } else if (map1.has(AUTOEXEC_KEY)) {
                map1.get(AUTOEXEC_KEY).set(it[1], it[0].trim())
            }
        })
    map1.get(AUTOEXEC_KEY).forEach(v => {
        file[lastAutoexecLine++] += r
        file[lastAutoexecLine] = v
    })
    file = file.join('\n')
    dnl.disabled = false
}

function fileDownload() {
    const blobUrl = URL.createObjectURL(new Blob([file], {
        type: 'text/plain'
    }))
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = names[OUT]
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
}

function readFile(p, file) {
    fr.addEventListener('load', () => {
        if (fr.result !== files[p]) {
            files[p] = fr.result
            if (p === OUT) {
                r = fr.result.includes('\r') ? '\r' : ''
            }
            if (files[IN] && files[OUT]) {
                go.disabled = false
                return
            }
            go.disabled = true
        }
    }, { once: true })
    fr.readAsText(file)
}

function displayAndStoreFileName(p, el) {
    const temp = el.value.split('\\')
    names[p] = el.nextElementSibling.textContent = temp[temp.length - 1]
}

function cancel(p) {
    files[p] = null
    go.disabled = dnl.disabled = true
    this.nextElementSibling.textContent = '--'
}

const from = document.querySelector('#from')
from.addEventListener('change', fileAdd)
from.addEventListener('cancel', cancel.bind(from, 0))
const to = document.querySelector('#to')
to.addEventListener('change', fileAdd2)
to.addEventListener('cancel', cancel.bind(to, 1))
const go = document.querySelector('#go')
go.addEventListener('click', goProcess)
go.disabled = true
const dnl = document.querySelector('#dnl')
dnl.addEventListener('click', fileDownload)
dnl.disabled = true
