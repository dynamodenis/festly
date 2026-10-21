import { ListEditor } from "../ListEditor"
import { Group, TextField, ToggleField } from "../fields"
import { ImageField } from "../media"

type Account = { bank: string; holder: string; number: string }
type Wallet = { provider: string; holder: string; number: string }
type Link = { label: string; url: string }

export function GiftsTab() {
  return (
    <>
      <Group
        title="Gifts"
        description="Optional. Guests see these behind an “Open envelope” button."
      >
        <ToggleField path={["gifts", "enabled"]} label="Show gift details" />
        <ToggleField
          path={["features", "gifts"]}
          label="Include the gifts section"
        />
      </Group>
      <Group title="Bank accounts">
        <ListEditor<Account>
          path={["gifts", "accounts"]}
          max={10}
          addLabel="Add account"
          itemLabel={(a, i) => a.bank || `Account ${i + 1}`}
          create={() => ({ bank: "Bank", holder: "Name", number: "0000" })}
        >
          {(_, p) => (
            <>
              <TextField path={[...p, "bank"]} label="Bank" maxLength={80} />
              <TextField
                path={[...p, "holder"]}
                label="Account holder"
                maxLength={120}
              />
              <TextField
                path={[...p, "number"]}
                label="Account number"
                maxLength={60}
              />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="Mobile money & wallets">
        <ListEditor<Wallet>
          path={["gifts", "ewallets"]}
          max={10}
          addLabel="Add wallet"
          itemLabel={(w, i) => w.provider || `Wallet ${i + 1}`}
          create={() => ({ provider: "M-Pesa", holder: "Name", number: "07…" })}
        >
          {(_, p) => (
            <>
              <TextField
                path={[...p, "provider"]}
                label="Provider"
                maxLength={60}
              />
              <TextField path={[...p, "holder"]} label="Name" maxLength={120} />
              <TextField
                path={[...p, "number"]}
                label="Number"
                maxLength={60}
                type="tel"
              />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="Registry links">
        <ListEditor<Link>
          path={["gifts", "registryLinks"]}
          max={10}
          addLabel="Add link"
          itemLabel={(l, i) => l.label || `Link ${i + 1}`}
          create={() => ({ label: "Our registry", url: "https://" })}
        >
          {(_, p) => (
            <>
              <TextField path={[...p, "label"]} label="Label" maxLength={80} />
              <TextField
                path={[...p, "url"]}
                label="Link"
                type="url"
                placeholder="https://"
              />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="Payment QR code">
        <ImageField
          path={["gifts", "qrImage"]}
          label="QR image"
          help="A screenshot of your payment QR code."
        />
      </Group>
    </>
  )
}
