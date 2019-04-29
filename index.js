
const defaultAlertSettings = {
  specVersion: 1,
  pollingInterval: "ONE_DAY",
  outputs: [
    "alertLevel"
  ],
  operations: [
    {
      when: {
        type: "FILTER",
        specVersion: 1,
        condition: [
          "AND",
          [ "queries.query0.total", ">", 0 ]
        ]
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