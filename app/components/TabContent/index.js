import React, { Component } from 'react'
import path from 'path'
import { connect } from 'react-redux'
import SplitPane from 'react-split-pane'

import CodeEditor from 'components/CodeEditor'
import TabIframe from 'components/TabIframe'
import Button from 'components/Button'

import { setTabValue } from 'reducers/tabs'

import './style.scss'

@connect(state => ({
  currentTab: state.tabs.find(t => t.get('isFocused')) || null,
}), {
  setTabValue,
})
class TabContent extends Component {

  renderUnhandled (ext) {
    return (
      <div className='sticky z' style={{ opacity: 0.5 }}>
        {`Files with extension ${ext} are not handled.`}
      </div>
    )
  }

  renderMJML (tab) {
    return (
      <SplitPane
        className='sticky'
        split='vertical'
        primary='second'
        minSize={300}
      >
        <CodeEditor
          filePath={tab.get('path')}
          onChange={v => this.props.setTabValue(v)}
        />
        <TabIframe tab={tab} />
      </SplitPane>
    )
  }

  renderImage (tab) {
    const imgUrl = `url(file://${tab.get('path')})`
    return (
      <div
        className='sticky'
        style={{
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: encodeURI(imgUrl),
        }}
      />
    )
  }

  renderTab (tab) {
    const ext = path.extname(tab.get('name'))

    switch (ext) {
    case '.mjml': return this.renderMJML(tab)
    case '.png':
    case '.jpg':
      return this.renderImage(tab)
    default: return this.renderUnhandled(ext)
    }
  }

  render () {

    const {
      currentTab,
    } = this.props

    return (
      <div className='TabContent sticky'>
        {currentTab ? this.renderTab(currentTab) : (
          <div className='sticky z TabContent-empty'>
            <div style={{ opacity: 0.5 }}>
              {'Nothing selected.'}
            </div>
            <div className='mt-20'>
              <Button link to='/' primary>
                {'Back to home'}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

}

export default TabContent
