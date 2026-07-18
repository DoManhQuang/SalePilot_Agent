"""Multi-category product catalog backed by MongoDB.

This package generalizes SalePilot beyond refrigerators to every product
category present in the source spreadsheet. It has three layers:

- ``normalize``   — shared Vietnamese spec parsers (units, prices, ranges).
- ``categories``  — a declarative registry: one config per category encoding
  detection keywords, normalized specs, need slots, priorities and trade-offs
  ("rule sâu cho từng ngành" expressed as data).
- ``repository``  — loads products from MongoDB into an in-memory cache with a
  JSON snapshot fallback so the offline agent path keeps working.
"""
