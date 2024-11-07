function fileAdd() {
    displayAndStoreFileName(IN, this)
    readFile(IN, this.files[0])
}

const fileAdd2 = ev => {
    displayAndStoreFileName(OUT, ev.target)
    readFile(OUT, ev.target.files[0])
}

function cancel(p) {
    files[p] = null
    go.disabled = dnl.disabled = true
    this.nextElementSibling.textContent = '--'
}

function displayAndStoreFileName(p, el) {
    const temp = el.value.split('\\')
    names[p] = el.nextElementSibling.textContent = temp[temp.length - 1]
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

function fillAutoexec(map, ptr) {
    map.get(AUTOEXEC_KEY).forEach(v => {
        file[ptr.lastAutoexecLine++] += r
        file[ptr.lastAutoexecLine] = v
    })
}

function fillMissedValues(missedLines, ptr) {
    file[ptr.lastAutoexecLine++] += r
    file[ptr.lastAutoexecLine] = '# mismatched values'
    missedLines.forEach(it => {
        file[ptr.lastAutoexecLine++] += r
        file[ptr.lastAutoexecLine] = it
    })
}
