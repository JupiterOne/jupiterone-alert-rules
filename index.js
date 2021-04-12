
const defaultAlertSettings = {
  specVersion: 1,
  pollingInterval: "ONE_WEEK",
  outputs: [
    "queries.query0.total",
    "alertLevel"
  ],
  operations: [
    {
      when: {
        type: "FILTER",
        specVersion: 1,
        condition: "{{queries.query0.total > 0}}"
      },
      actions: [
        {
          type: "SET_PROPERTY",
          targetProperty: "alertLevel",
          targetValue: "HIGH"
        },
        {
          type: "CREATE_ALERT"
        }
      ]
    }
  ]
}

module.exports = {
  defaultAlertSettings
}
