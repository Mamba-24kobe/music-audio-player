/* eslint-disable no-unused-expressions */
import React, { useState, useRef, useEffect } from 'react'
import { List } from 'antd'
import {
  RightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  BackwardOutlined,
  CaretRightOutlined,
  PauseOutlined,
  MenuOutlined,
  LeftOutlined,
  createFromIconfontCN
} from '@ant-design/icons'
import 'antd/dist/antd.css';
import './index.less'
import { musicData } from './common/const.js'
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2508468_2a47olfpkfy.js'
})
const playModeMap = [
  { type: 'icon-list', title: '列表循环', mode: 'next' },
  { type: 'icon-danqu', title: '单曲循环', mode: 'current' },
  { type: 'icon-suiji', title: '随机播放', mode: 'random' }
]
// 将秒数转为00:00格式
const timeToStr = (value: number) => {
  let time = ''
  const h: number | string = Math.floor(value / 3600)
  let m: number | string = Math.floor((value % 3600) / 60)
  let s: number | string = Math.floor(value % 60)
  // h = h < 10 ? '0' + h : h + '';
  m = m < 10 ? '0' + m : m + ''
  s = s < 10 ? '0' + s : s + ''
  if (h > 0) {
    time = h + ':' + m + ':' + s
  } else {
    time = m + ':' + s
  }
  return time
}
function randomIndex(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
interface SongItem {
  title: string
  author: string
  url: string
  pic: string
  lrc: string
}
export const Music = (props: any) => {
  const { musicList = musicData } = props
  const audioRef = useRef(null)
  const processRef = useRef(null)
  const [currSong, setCurrSong] = useState<SongItem>(musicList[0])
  const [currSongIndex, setCurrSongIndex] = useState(0)
  const [isPlay, setIsPlay] = useState(false)
  const [playModeIndex, setPlayModeIndex] = useState(0)
  const [isExpand, setIsExpand] = useState(false)
  const [isShowList, setIsShowList] = useState(false)
  const [totalTimeStr, setTotalTimeStr] = useState('')
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00')

  useEffect(() => {
    const timeupdate = () => {
      // @ts-ignore
      const currentTime = audioRef?.current?.currentTime
      setCurrentTimeStr(timeToStr(currentTime))
      // @ts-ignore
      if (currentTime >= audioRef?.current.duration) {
        // @ts-ignore
        processRef.current.style.width = '0px'
        setCurrentTimeStr('00:00')
        console.log(playModeIndex, '前')
        setPlayMode()
        console.log(playModeIndex, '后')
      } else {
        // @ts-ignore
        processRef.current.style.width =
          // @ts-ignore
          (currentTime / Math.floor(audioRef?.current.duration)) * 180 + 'px'
      }
    }
    // @ts-ignore
    audioRef?.current.addEventListener('timeupdate', timeupdate)
    return () => {
      // @ts-ignore
      audioRef?.current.removeEventListener('timeupdate', timeupdate)
    }
  }, [playModeIndex])

  useEffect(() => {
    console.log(audioRef, 'audioRef132')
    // @ts-ignore
    setTotalTimeStr(timeToStr(audioRef?.current?.duration))
  }, [isExpand])
  const setPlayMode = () => {
    console.log(playModeIndex, '见鬼了')
    handleChangeCurrIndex(playModeMap[playModeIndex].mode)
  }
  const handlePlay = (play: boolean) => {
    if (play) {
      // @ts-ignore
      audioRef.current.play()
    } else {
      // @ts-ignore
      audioRef.current.pause()
    }
    setIsPlay(play)
  }
  const handleCutSong = (song: SongItem, index: number) => {
    setCurrSong(song)
    setCurrSongIndex(index)
  }
  const handleExpand = () => {
    setIsExpand(!isExpand)
  }
  const handleChangeCurrIndex = async (type: string) => {
    let index = currSongIndex
    if (type === 'prev') {
      index = currSongIndex === 0 ? musicList.length - 1 : currSongIndex - 1
    } else if (type === 'next') {
      index = currSongIndex === musicList.length - 1 ? 0 : currSongIndex + 1
    } else if (type === 'random') {
      index = randomIndex(0, musicList.length - 1)
    }
    await setCurrSong(musicList[index])
    await setCurrSongIndex(index)
    // @ts-ignore
    await audioRef.current.play()
    // @ts-ignore
    await setTotalTimeStr(timeToStr(audioRef?.current?.duration))
  }
  const handleChangeMode = () => {
    if (playModeIndex < playModeMap.length - 1) {
      setPlayModeIndex((playModeIndex: number) => playModeIndex + 1)
    } else {
      setPlayModeIndex(0)
    }
  }
  // 点击进度
  const updateProcess = (e: any) => {
    // @ts-ignore
    audioRef.current.currentTime =
      // @ts-ignore
      (e.nativeEvent.offsetX / 180) * audioRef?.current?.duration
  }

  return (
    <div className='Music'>
      <audio id='music' ref={audioRef} src={currSong.url} />
      <div className='music-container'>
        {isExpand && isShowList && (
          <div className='music-list'>
            <List
              size='small'
              bordered
              dataSource={musicList}
              renderItem={(item: SongItem, index) => (
                <List.Item
                  onClick={() => handleCutSong(item, index)}
                  className={
                    currSongIndex === index
                      ? 'list-item activeSong'
                      : 'list-item'
                  }
                >
                  <span>{index + 1}. </span>
                  {item.title}
                </List.Item>
              )}
            />
          </div>
        )}

        <div className='music-body'>
          {isExpand && (
            <div className='music-control'>
              <div
                className='music-image'
                style={{ background: `url(${currSong.pic}) no-repeat` }}
              >
                {isPlay ? (
                  <PauseCircleOutlined
                    onClick={() => handlePlay(false)}
                    className='music-icon'
                  />
                ) : (
                  <PlayCircleOutlined
                    onClick={() => handlePlay(true)}
                    className='music-icon'
                  />
                )}
              </div>
              <div className='control-btn' style={{ padding: '5px' }}>
                <div className='d-flex ai-center jc-around'>
                  <span className='songTitle'>
                    {currSong.title}
                    <span> - {currSong.author}</span>
                  </span>
                  <BackwardOutlined
                    className='control-icon'
                    onClick={() => handleChangeCurrIndex('prev')}
                  />
                  {isPlay ? (
                    <PauseOutlined
                      className='control-icon'
                      onClick={() => handlePlay(false)}
                    />
                  ) : (
                    <CaretRightOutlined
                      className='control-icon'
                      onClick={() => handlePlay(true)}
                    />
                  )}
                  <ForwardOutlined
                    className='control-icon'
                    onClick={() => handleChangeCurrIndex('next')}
                  />
                  <MenuOutlined
                    className='control-icon'
                    onClick={() => setIsShowList(!isShowList)}
                  />
                </div>
                <div className='audio-box d-flex ai-center jc-around'>
                  <div className='process-box d-flex ai-center'>
                    {/* <div
                      className={
                        isPlay ? "time remember anim-rem" : "time remember"
                      }
                    >
                      <span
                        style={{ display: "inline-block", width: "180px" }}
                      ></span>
                    </div> */}
                    <div
                      className='totalProcess'
                      onClick={($event) => updateProcess($event)}
                    >
                      <div ref={processRef} className='playProcess' />
                    </div>
                  </div>
                  <span className='time'>
                    {currentTimeStr}/{totalTimeStr}
                  </span>
                  <IconFont
                    type={playModeMap[playModeIndex].type}
                    onClick={handleChangeMode}
                    title={playModeMap[playModeIndex].title}
                    style={{ fontSize: '15px' }}
                  />
                  <IconFont
                    type='icon-geci'
                    title='歌词'
                    style={{ fontSize: '15px' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className='music-expand' onClick={handleExpand}>
            {isExpand ? <LeftOutlined /> : <RightOutlined />}
          </div>
        </div>
      </div>
    </div>
  )
}
