const files = [null, null], names = [], fr = new FileReader(), IN = 0, OUT = 1, AUTOEXEC_KEY = '[autoexec]', SKIP_KEYS = ['mapperfile']
let r, file

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

function goProcess() {
    const map = new Map(), map1 = new Map(), missedLines = []
    let section, lastAutoexecLine

    file = files[IN].split('\n')
    file.map((it, idx) => [it.trimStart(), idx])
        .filter(it => !it[0].startsWith('#'))
        .forEach(it => {
            if (it[0].startsWith('[')) {
                map.set(section = it[0].replace(/\s+/g, ''), new Map())
            } else if (section !== AUTOEXEC_KEY && it[0].includes('=')) {
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
            } else if (section !== AUTOEXEC_KEY && it[0].includes('=')) {
                const split = it[0].split(/=(.*)/g)
                const split0Clean = split[0].trimEnd()
                const split1Clean = split[1].trim()
                map1.get(section).set(split0Clean, [split1Clean, it[1], split[0]])
                const toCompare = map.get(section).get(split0Clean)
                if (toCompare && toCompare[0] !== split1Clean && !SKIP_KEYS.includes(split0Clean)) {
                    file[toCompare[1]] = toCompare[2] + '= ' + split1Clean + r
                } else if (!toCompare) {
                    missedLines.push('# ' + split[0] + '= ' + split1Clean)
                }
            } else if (map1.has(AUTOEXEC_KEY)) {
                map1.get(AUTOEXEC_KEY).set(it[1], it[0].trim())
            }
        })
    fillAutoexec(map1, lastAutoexecLine = { lastAutoexecLine })
    fillMissedValues(missedLines, lastAutoexecLine)
    file = file.join('\n')
    dnl.disabled = false
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
