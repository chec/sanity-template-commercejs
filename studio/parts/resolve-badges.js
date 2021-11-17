import defaultResolve from 'part:@sanity/base/document-badges'
import { CommerceBadge } from '../components/commerce-badge'

export default function resolveBadges(props) {
  const badges = defaultResolve(props)
  if (props?.published?.wasDeleted) {
    return [...badges, CommerceBadge]
  }
  return badges
}
