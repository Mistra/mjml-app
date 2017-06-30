import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { fromJS } from 'immutable'
import IconFolder from 'react-icons/md/folder'
import IconFile from 'react-icons/md/insert-drive-file'
import IconFolderClosed from 'react-icons/md/keyboard-arrow-right'
import IconFolderOpen from 'react-icons/md/keyboard-arrow-down'
import IconMJML from 'mailjet-icons/react/mjml'
import IconImage from 'react-icons/md/photo'

import Tabbable from 'components/Tabbable'

import {
  readDir,
  sortFiles,
} from 'helpers/fs'

import './style.scss'

async function fetchDir (path) {
  const files = await readDir(path)
  sortFiles(files)
  return fromJS(files)
}

class FileTree extends Component {

  static propTypes = {
    nesting: PropTypes.number,
    focusedFilePath: PropTypes.string,
  }

  static defaultProps = {
    nesting: 0,
  }

  state = {
    files: fromJS([]),
  }

  componentDidMount () {
    window.requestIdleCallback(this.refreshFiles)
  }

  refreshFiles = async () => {
    const { base } = this.props
    const files = await fetchDir(base)
    this.safeSetState({ files: fromJS(files) })
  }

  safeSetState = (...args) => this.setState(...args)

  render () {

    const {
      focusedFilePath,
      onFileClick,
      nesting,
    } = this.props

    const {
      files,
    } = this.state

    return (
      <div>
        {files.map(file => (
          <FileItem
            focusedFilePath={focusedFilePath}
            nesting={nesting}
            key={file.get('path')}
            file={file}
            onFileClick={onFileClick}
          />
        ))}
      </div>
    )
  }

}

class FileItem extends Component {

  state = {
    isOpened: false,
  }

  componentWillReceiveProps (nextProps) {

    const {
      file,
      focusedFilePath,
    } = nextProps

    const {
      isOpened,
    } = this.state

    const isFolder = file.get('isFolder')
    const filePath = file.get('path')

    // open folder when focusing file in nested folder
    if (focusedFilePath && isFolder && !isOpened && focusedFilePath.startsWith(filePath)) {
      this.setState({ isOpened: true })
    }
  }

  handleToggle = () => {
    this.setState({ isOpened: !this.state.isOpened })
  }

  handleSelect = () => {
    const { file, onFileClick } = this.props
    onFileClick(file.get('path'))
  }

  render () {

    const {
      file,
      onFileClick,
      nesting,
      focusedFilePath,
      setRef,
    } = this.props

    const {
      isOpened,
    } = this.state

    const filePath = file.get('path')
    const fileName = file.get('name')
    const isFolder = file.get('isFolder')
    const isImage = filePath.endsWith('.jpg')
      || filePath.endsWith('.png')
      || filePath.endsWith('.gif')

    setRef && setRef(this)

    return (
      <div>

        <Tabbable
          className={cx('d-f ai-c p-5 cu-d FileTree-item-label', {
            isActive: filePath === focusedFilePath,
          })}
          style={{
            paddingLeft: nesting * 20 + 5,
          }}
          onClick={isFolder ? this.handleToggle : undefined}
          onDoubleClick={isFolder ? undefined : this.handleSelect}
        >
          {isFolder && (
            <div className='z fs-0' style={{ width: 15 }}>
              {isOpened ? <IconFolderOpen /> : <IconFolderClosed />}
            </div>
          )}
          <div className='z fs-0' style={{ width: 15, marginRight: 2 }}>
            {isFolder && <IconFolder opacity={0.6} color='#3470df' />}
            {!isFolder && (
              filePath.endsWith('.mjml') ? (
                <IconMJML color='#f06451' size={12} />
              ) : isImage ? (
                <IconImage />
              ) : (
                <IconFile />
              )
            )}
          </div>
          <div className='fg-1 ellipsis'>
            {fileName}
          </div>
        </Tabbable>

        {isFolder && isOpened && (
          <FileTree
            focusedFilePath={focusedFilePath}
            nesting={nesting + 1}
            base={filePath}
            onFileClick={onFileClick}
          />
        )}

      </div>
    )
  }

}

class FileExplorer extends Component {

  refresh = () => this._fileTree.refreshFiles()

  render () {
    const {
      base,
      onFileClick,
      focusedFilePath,
      setRef,
    } = this.props

    setRef(this)

    return (
      <div className='FileExplorer sticky'>
        <FileTree
          setRef={n => this._fileTree = n}
          base={base}
          onFileClick={onFileClick}
          focusedFilePath={focusedFilePath}
        />
      </div>
    )
  }

}

export default FileExplorer
