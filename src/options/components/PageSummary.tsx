import React from 'react'
import { useCallback } from 'preact/hooks'
import {
  Text,
  Textarea,
  Card,
  Button,
  useToasts,
  Divider,
  Toggle,
  Spacer,
  Description,
} from '@geist-ui/core'
import { updateUserConfig } from '@/config'
import { changeToast } from '@/utils/utils'

export interface PageSummaryProps {
  pageSummaryEnable: boolean
  setPageSummaryEnable: (state: boolean) => void
  pageSummaryWhitelist: string
  setPageSummaryWhitelist: (whitelist: string) => void
  pageSummaryBlacklist: string
  setPageSummaryBlacklist: (blacklist: string) => void
}

function PageSummaryComponent(props: PageSummaryProps) {
  const {
    pageSummaryEnable,
    setPageSummaryEnable,
    pageSummaryWhitelist,
    pageSummaryBlacklist,
    setPageSummaryWhitelist,
    setPageSummaryBlacklist,
  } = props
  const { setToast } = useToasts()

  const onPageSummarySave = useCallback(() => {
    updateUserConfig({ pageSummaryWhitelist, pageSummaryBlacklist })
    setPageSummaryWhitelist(pageSummaryWhitelist)
    setPageSummaryBlacklist(pageSummaryBlacklist)
    setToast(changeToast)
  }, [
    pageSummaryBlacklist,
    pageSummaryWhitelist,
    setPageSummaryBlacklist,
    setPageSummaryWhitelist,
    setToast,
  ])

  const onPageSummaryEnableChange = useCallback(
    (e: React.ChangeEvent) => {
      const value = e.target.checked
      setPageSummaryEnable(value)
      updateUserConfig({ pageSummaryEnable: value })
      setToast(changeToast)
    },
    [setPageSummaryEnable, setToast],
  )

  const onPageSummaryWhitelistChange = useCallback(
    (e: React.ChangeEvent) => {
      const value = e.target.value || ''
      setPageSummaryWhitelist(value)
    },
    [setPageSummaryWhitelist],
  )

  const onPageSummaryBlacklistChange = useCallback(
    (e: React.ChangeEvent) => {
      const value = e.target.value || ''
      setPageSummaryBlacklist(value)
    },
    [setPageSummaryBlacklist],
  )

  return (
    <>
      <Text h3 className="beyondbard--mt-5">
        Page Summary
      </Text>

      <Card>
        <Card.Content>
          <Text
            h5
            className="beyondbard--mb-0 beyondbard--flex beyondbard--flex-row beyondbard--items-center beyondbard--gap-1"
          >
            <Toggle
              initialChecked
              checked={pageSummaryEnable}
              onChange={onPageSummaryEnableChange}
            />{' '}
            Show BeyondBard Icon
          </Text>
          <Text className="beyondbard--mt-0" font="12px">
            Once hidden, the BeyondBard icon will no longer appear on the page. However, you can open
            the page summary by clicking on the browser extension icon.
          </Text>
        </Card.Content>
        <Divider />
        <Card.Content>
          <Text h4 className="beyondbard--mb-0">
            Whitelist Sites
          </Text>
          <Text className="beyondbard--mt-0" font="12px">
            Only display the BeyondBard icon on these sites (one URL per line).
          </Text>
          <Spacer h={0.5} />
          <Textarea
            placeholder="https://ishandutta2007.github.io/BeyondBard
https://reddit.com"
            resize={'vertical'}
            value={pageSummaryWhitelist}
            style={{ width: '400px', height: '100px' }}
            onChange={onPageSummaryWhitelistChange}
          />
        </Card.Content>
        <Divider />
        <Card.Content>
          <Text h4 className="beyondbard--mb-0">
            Blacklist Sites
          </Text>
          <Text className="beyondbard--mt-0" font="12px">
            Do not display BeyondBard icon on these sites (one URL per line).
          </Text>
          <Spacer h={0.5} />
          <Textarea
            placeholder="https://ishandutta2007.github.io/BeyondBard
https://reddit.com"
            resize={'vertical'}
            value={pageSummaryBlacklist}
            style={{ width: '400px', height: '100px' }}
            onChange={onPageSummaryBlacklistChange}
          />
        </Card.Content>
        <Card.Footer>
          <Button scale={2 / 3} style={{ width: 20 }} type="success" onClick={onPageSummarySave}>
            Save
          </Button>
        </Card.Footer>
      </Card>
    </>
  )
}

export default PageSummaryComponent
