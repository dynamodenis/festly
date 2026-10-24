import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { AuthField } from "./AuthShell"

afterEach(cleanup)

describe("AuthField", () => {
  it("lets people show and hide a password", () => {
    render(<AuthField id="pw" label="Password" type="password" />)
    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")

    fireEvent.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("adds no toggle to other fields", () => {
    render(<AuthField id="em" label="Email" type="email" />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
  })
})
