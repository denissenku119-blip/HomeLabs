# Connection line visual update

## Scope
- Change only the existing canvas connection renderer.
- Replace straight segments with smooth green Bezier paths attached to the current component edge points.
- Add lightweight path separation for multiple connections and a subtle glow while keeping lines behind hardware cards.
- Preserve the existing touch target, selection, removal, movement, persistence, and connection data.

## Validation
- Confirm the app builds cleanly.
- Verify connections render, remain selectable/removable, and follow moved components on desktop and phone-sized views.
