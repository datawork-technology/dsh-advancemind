/** AdvanceMind occupants for the generic sidebar brand slots. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {
  SidebarBrandMarkOwnerProps,
  SidebarBrandNameOwnerProps,
} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Brand colour shared by the mark, the wordmark accent, and the native icons. */
export const ADVANCEMIND_BRAND_COLOR = '#4F46E5'

/** Product name shown wherever a host surface needs the bare brand string. */
export const ADVANCEMIND_NAME = 'AdvanceMind'

/**
 * AdvanceMind mark: a solid "A" with a triangular counter.
 *
 * Tray bitmaps render this same artwork down to 16px, so the silhouette stays a
 * single bold shape rather than a multi-stroke glyph.
 * @param props - host-supplied square edge in pixels.
 * @returns the AdvanceMind mark.
 */
export function AdvanceMindMark({ size }: SidebarBrandMarkOwnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={ADVANCEMIND_NAME}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.2 22.4 21.8 17.7 21.8 15.7 17.9 8.3 17.9 6.3 21.8 1.6 21.8ZM12 9.4 9.9 13.6 14.1 13.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * AdvanceMind wordmark.
 *
 * Rendered as live text rather than engraved vector letterpaths so it inherits
 * the surrounding UI type stack and survives locale and font changes.
 * @returns the AdvanceMind wordmark.
 */
export function AdvanceMindName(_props: SidebarBrandNameOwnerProps) {
  return (
    <span
      aria-label={ADVANCEMIND_NAME}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        whiteSpace: 'nowrap',
        fontWeight: 650,
        letterSpacing: '-0.02em',
      }}
    >
      <span>Advance</span>
      <span style={{ fontWeight: 450, opacity: 0.72 }}>Mind</span>
    </span>
  )
}

/**
 * Claim the sidebar brand cells.
 *
 * `sidebar.brand.mark` and `sidebar.brand.name` are single-occupancy slots whose
 * shells fall back to the upstream mark, so this deployment must occupy both:
 * leaving the mark empty would restore the upstream fallback. Registrations are
 * deferred through `inject` because both slots are declared by the sidebar
 * package, and registering into an undeclared slot throws.
 * @param ctx - browser Cordis context carrying the slot registry.
 */
export function applyAdvanceMindBrand(ctx: ClientContext): void {
  ctx.slots.inject(
    'sidebar.brand.mark',
    () => ctx.slots.register({ name: 'sidebar.brand.mark' }, AdvanceMindMark),
  )
  ctx.slots.inject(
    'sidebar.brand.name',
    () => ctx.slots.register({ name: 'sidebar.brand.name' }, AdvanceMindName),
  )
}
