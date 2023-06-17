import { XIcon, TrashIcon, CopyIcon, CheckIcon } from '@primer/octicons-react'
import { useEffect, useState, useCallback, useRef } from 'preact/hooks'
import classNames from 'classnames'
import { memo, useMemo } from 'react'
import { Loading } from '@geist-ui/core'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { Answer } from '@/messaging'
import ChatGPTFeedback from './ChatGPTFeedback'
import { debounce } from 'lodash-es'
import { isBraveBrowser, shouldShowRatingTip } from '@/content-script/utils'
import { BASE_URL } from '@/config'
import { isIOS, isSafari } from '@/utils/utils'
import { getUserConfig } from '@/config'

import '@/content-script/styles.scss'

export type QueryStatus = 'success' | 'error' | 'done' | undefined

interface Props {
  triggerMode: any
  question: string
  onStatusChange?: (status: QueryStatus) => void
  currentTime?: number
}

interface Requestion {
  requestion: string
  index: number
  answer: Answer | null
}

interface ReQuestionAnswerProps {
  latestAnswerText: string | undefined
}

function ChatGPTQuery(props: Props) {
  const { onStatusChange, currentTime, question } = props
  const inputRef = useRef<HTMLInputElement>(null)

  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  // const [delcnt, setDelcnt] = useState(0)
  const [done, setDone] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [continueConversation, setContinueConversation] = useState(false)
  const [status, setStatus] = useState<QueryStatus>()

  const [reError, setReError] = useState('')
  const [reQuestionDone, setReQuestionDone] = useState(false)
  const [requestionList, setRequestionList] = useState<Requestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reQuestionLatestAnswerText, setReQuestionLatestAnswerText] = useState<string | undefined>()

  const wrapRef = useRef<HTMLDivElement | null>(null)

  const requestGpt = useMemo(() => {
    console.debug('question', question)

    return debounce(() => {
      setStatus(undefined)
      // setError('error')
      // setStatus('error')
      // return

      const port = Browser.runtime.connect()
      const listener = (msg: any) => {
        console.debug("ChatGPTQuery msg=", msg);
        if (msg.text) {
          let text = msg.text || ''
          text = text.replace(/^(\s|:\n\n)+|(:)+|(:\s)$/g, '')

          setAnswer({ ...msg, ...{ text } })
          setStatus('success')
        } else if (msg.error) {
          setError(msg.error)
          setStatus('error')
        } else if (msg.event === 'DONE') {
          setDone(true)
          setReQuestionDone(true)
          setStatus('done')
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({ question })
      return () => {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }, 1000)
  }, [question])

  const newTab = useCallback(() => {
    Browser.runtime.sendMessage({
      type: 'NEW_TAB',
      data: {
        url: `${BASE_URL}/chat`,
      },
    })
  }, [])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    requestGpt()
  }, [question, retry, currentTime, requestGpt])

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    shouldShowRatingTip().then((show) => setShowTip(show))
  }, [])

  useEffect(() => {
    getUserConfig().then((settings) => setContinueConversation(settings.continueConversation))
  }, [])

  useEffect(() => {
    const wrap: HTMLDivElement | null = wrapRef.current
    if (!wrap) {
      return
    }
    console.debug("ChatGPTQuery answer=",answer);
    if (answer) {
      wrap.scrollTo({
        top: 10000,
        behavior: 'smooth',
      })
    }
  }, [answer])


  // requestion
  useEffect(() => {
    if (!requestionList[questionIndex]) return
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      try {
        if (msg.text) {
          const requestionListValue = requestionList
          requestionListValue[questionIndex].answer = msg
          requestionListValue[questionIndex].answer.question_index = questionIndex
          setRequestionList(requestionListValue)
          const latestAnswerText = requestionList[questionIndex]?.answer?.text
          setReQuestionLatestAnswerText(latestAnswerText)
        } else if (msg.event === 'DONE') {
          setReQuestionDone(true)
          setQuestionIndex(questionIndex + 1)
        }
      } catch(e){
        console.log(e);
        setReError(msg.error)
      }
    }
    port.onMessage.addListener(listener)
    port.postMessage({
      question: requestionList[questionIndex].requestion,
      conversationId: answer?.conversationId,
      parentMessageId:
        questionIndex == 0
          ? answer?.messageId
          : requestionList[questionIndex - 1].answer?.messageId,
      conversationContext:
        questionIndex == 0
          ? answer?.conversationContext
          : requestionList[questionIndex - 1].answer?.conversationContext,
    })
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [
    requestionList,
    questionIndex,
    answer?.conversationId,
    answer?.messageId,
    answer?.conversationContext,
  ])

  // * Requery Handler Function
  const requeryHandler = useCallback(() => {
    if (inputRef.current) {
      setReQuestionDone(false)
      const requestion = inputRef.current.value
      setRequestionList([...requestionList, { requestion, index: questionIndex, answer: null }])
      inputRef.current.value = ''
    }
  }, [requestionList, questionIndex])

  const FollowupQuestionFixed = ({ followup_question }: { followup_question: string | undefined }) => {
    const clickCopyToInput = useCallback(async () => {
      inputRef.current.value = followup_question;
      const timer = setTimeout(() => {
        requeryHandler()
      }, 500)
    }, [followup_question])

    return (
      <div class="followup-question-container" onClick={clickCopyToInput}>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>{followup_question}</ReactMarkdown>
      </div>
    )
  }

  const ReQuestionAnswerFixed = ({ answer }: { answer: string | undefined } ) => {
    // const [trashIconClicked, setTrashIconClicked] = useState(false)
    // const trashQuestion = useCallback( () => {
    //   setTrashIconClicked(true);
    //   console.log("deleting", answer.question_index);
    //   let requestionListSplicedValue = requestionList.slice();
    //   requestionListSplicedValue.splice(answer.question_index, 1);
    //   setRequestionList(requestionListSplicedValue);
    //   setDelcnt((delcnt) => delcnt + 1);
    // }, [answer])

    // useEffect(() => {
    //   if (trashIconClicked) {
    //     const timer = setTimeout(() => {
    //       setTrashIconClicked(false)
    //     }, 500)
    //     return () => clearTimeout(timer)
    //   }
    // }, [trashIconClicked])
          // <span onClick={trashQuestion}>
          //   {trashIconClicked ? <XIcon size={14} /> : <TrashIcon size={14} />}
          // </span>


    const [copyIconClicked, setCopyIconClicked] = useState(false)
    const clickCopyToClipboard = useCallback(async () => {
      await navigator.clipboard.writeText(answer?.text)
      setCopyIconClicked(true)
    }, [answer])

    useEffect(() => {
      if (copyIconClicked) {
        const timer = setTimeout(() => {
          setCopyIconClicked(false)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [copyIconClicked])

    if (!answer.text) return <p className="text-[#b6b8ba] animate-pulse">Answering...</p>
    return (
      <div class="requestion-answer-container">
        <div className="gpt--feedback">
          <span onClick={clickCopyToClipboard}>
            {copyIconClicked ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </span>
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>{answer.text}</ReactMarkdown>
      </div>
    )
  }

  const ReQuestionAnswer = ({ latestAnswerText }: ReQuestionAnswerProps) => {
    const [copyIconClicked, setCopyIconClicked] = useState(false)
    const clickCopyToClipboard = useCallback(async () => {
      await navigator.clipboard.writeText(latestAnswerText)
      setCopyIconClicked(true)
    }, [latestAnswerText])

    useEffect(() => {
      if (copyIconClicked) {
        const timer = setTimeout(() => {
          setCopyIconClicked(false)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [copyIconClicked])

    if (!latestAnswerText || requestionList[requestionList.length - 1]?.answer?.text == undefined) {
      return <p className="text-[#b6b8ba] animate-pulse">Answering...</p>
    }
    return (
      <div class="requestion-answer-container">
        <div className="gpt--feedback">
          <span onClick={clickCopyToClipboard}>
            {copyIconClicked ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </span>
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {latestAnswerText}
        </ReactMarkdown>
      </div>
    )
  }

  const [copyIconClicked, setCopyIconClicked] = useState(false)
  const clickCopyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(answer?.text)
    setCopyIconClicked(true)
  }, [answer])

  useEffect(() => {
    if (copyIconClicked) {
      const timer = setTimeout(() => {
        setCopyIconClicked(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [copyIconClicked])

  if (answer) {
    console.debug("ChatGPTQuery answer2=", answer);
    console.debug("ChatGPTQuery continueConversation=", continueConversation);
    console.debug("ChatGPTQuery answer.conversationContext.contextIds=", answer.conversationContext.contextIds);
    console.debug("ChatGPTQuery done=", done);
    // console.debug("ChatGPTQuery latestAnswerText=", latestAnswerText);
    // className="markdown-body gpt-markdown" another culprit( wasat #gpt-answer)
          // < className="beyondbard--chatgpt--content" is the culprit >
          // <div className="beyondbard--chatgpt--header">
          // </div >
   let final_followups = [];
   let followup_section = "";

    let splits = answer.text.split("### Follow-up Questions:")
    if (splits.length == 1) splits = answer.text.split("### Follow-up Questions")
    if (splits.length == 1) splits = answer.text.split("**Follow-up Questions**")
    if (splits.length >= 2) {
      followup_section = splits[splits.length - 1]
      let rawsplits = followup_section.split("\n");
      for(var i = 0; i < rawsplits.length; i++) {
        let regnumexp = /[0-9]..*/gi;
        let regbulletexp = /\* .*/gi;
        if (rawsplits[i].match(regnumexp)) {
          final_followups.push(rawsplits[i].slice(2).trim());
        } else if (rawsplits[i].match(regbulletexp)) {
          let finesplits = rawsplits[i].split("* ");
          if (finesplits[finesplits.length-1].length > 4)
            final_followups.push(finesplits[finesplits.length-1].trim());
        }
      }
    }


    try {
      return (
        <div id="gpt-answer" dir="auto">
          <div className="beyondbard--chatgpt--content2" ref={wrapRef}>
            <div class="primary-answer-container">
              <div className="gpt--feedback">
                <span onClick={clickCopyToClipboard}>
                  {copyIconClicked ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </span>
              </div>
              <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
                {answer.text.replace(followup_section, "")}
              </ReactMarkdown>
            </div>

            <div className="all-questions-container">
              {requestionList.map((requestion) => (
                <div className="ith-question-container" key={requestion.index}>
                  <div className="font-bold">{`Q${requestion.index + 1} : ${
                    requestion.requestion
                  }`}</div>
                  {reError ? (
                    <p>
                      Failed to load response from BARD:
                      <span className="break-all block">{reError}</span>
                    </p>
                  ) : requestion.index < requestionList.length - 1 ? (
                    <ReQuestionAnswerFixed answer={requestion.answer}/>
                  ) : (
                    <ReQuestionAnswer latestAnswerText={reQuestionLatestAnswerText} />
                  )}
                </div>
              ))}
            </div>

            <div className="all-questions-container">
              {final_followups.map((followup_question) => (
                <div className="ith-question-container">
                  {(
                    <FollowupQuestionFixed followup_question={followup_question} />
                  )}
                </div>
              ))}
            </div>

          </div>

          {(continueConversation && answer.conversationContext.contextIds && done) && (
            <div>
              {/* <a href={`https://bard.google.com/c/${answer.conversationId}`} target="_blank">
              //   Continue conversation
               </a>*/}
              <form
                id="requestion"
                style={{ display: 'flex' }}
                onSubmit={(e) => {
                  // submit when press enter key
                  e.preventDefault()
                }}
              >
                <input
                  disabled={!reQuestionDone}
                  type="text"
                  ref={inputRef}
                  placeholder="Tell Me More"
                  id="question"
                />
                <button id="submit" onClick={requeryHandler}>
                  ASK
                </button>
              </form>
            </div>
          )}

        </div>
      )
    } catch (e) {
      console.log("DOM Rendering error", e)
    }
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        {isSafari ? (
          <>
            Please set Bard API Key in the{' '}
            <button
              className={classNames('beyondbard--btn', 'beyondbard--btn__primary', 'beyondbard--btn__small')}
              onClick={openOptionsPage}
            >
              extension options
            </button>
            .
          </>
        ) : (
          <>
            {' '}
            Please login and pass Cloudflare check at{' '}
            <button
              className={classNames('beyondbard--btn', 'beyondbard--btn__primary', 'beyondbard--btn__small')}
              onClick={newTab}
            >
              bard.google.com
            </button>
            .
          </>
        )}

        {retry > 0 &&
          !isIOS &&
          (() => {
            if (isBraveBrowser()) {
              return (
                <span className="beyondbard--block beyondbard--mt-2">
                  Still not working? Follow{' '}
                  <a href="https://github.com/ishandutta2007/beyond-bard#troubleshooting">
                    Brave Troubleshooting
                  </a>
                </span>
              )
            } else {
              return (
                <span className="beyondbard--italic beyondbard--block beyondbard--mt-2 beyondbard--text-xs">
                  Bard requires passing a security check every once in a while. 
                </span>
              )
            }
          })()}
      </p>
    )
  }
  if (error) {
    return (
      <p>
        Failed to load response from Bard:
        <span className="beyondbard--break-all beyondbard--block">{error}</span>
        <a
          href="javascript:void(0)"
          onClick={() => {
            setError('')
            setRetry((r) => r + 1)
          }}
        >
          Retry
        </a>
        <br />
      </p>
    )
  }

  return <Loading />
}

export default memo(ChatGPTQuery)
