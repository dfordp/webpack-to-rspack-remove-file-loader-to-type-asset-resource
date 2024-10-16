export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all objects within the rules array
  root.find(j.ObjectExpression).forEach((path) => {
      const properties = path.node.properties;

      // Check if the object has a 'use' property
      const useProperty = properties.find(
          (prop) =>
              j.ObjectProperty.check(prop) &&
              j.Identifier.check(prop.key) &&
              prop.key.name === 'use',
      );

      // Check if the object has a 'loader' property
      const loaderProperty = properties.find(
          (prop) =>
              j.ObjectProperty.check(prop) &&
              j.Identifier.check(prop.key) &&
              prop.key.name === 'loader' &&
              j.StringLiteral.check(prop.value) &&
              prop.value.value === 'file-loader',
      );

      if (useProperty) {
          // Check if 'use' is an array with 'file-loader' as a string or object
          const useValue = useProperty.value;
          if (j.ArrayExpression.check(useValue)) {
              const hasFileLoader = useValue.elements.some(
                  (element) =>
                      (j.StringLiteral.check(element) &&
                          element.value === 'file-loader') ||
                      (j.ObjectExpression.check(element) &&
                          element.properties.some(
                              (prop) =>
                                  j.ObjectProperty.check(prop) &&
                                  j.Identifier.check(prop.key) &&
                                  prop.key.name === 'loader' &&
                                  j.StringLiteral.check(prop.value) &&
                                  prop.value.value === 'file-loader',
                          )),
              );

              if (hasFileLoader) {
                  // Remove 'use' property and add 'type: asset/resource'
                  path.node.properties = properties.filter(
                      (prop) => prop !== useProperty,
                  );
                  path.node.properties.push(
                      j.objectProperty(
                          j.identifier('type'),
                          j.stringLiteral('asset/resource'),
                      ),
                  );
                  dirtyFlag = true;
              }
          }
      }

      if (loaderProperty) {
          // Remove 'loader' property and add 'type: asset/resource'
          path.node.properties = properties.filter(
              (prop) => prop !== loaderProperty,
          );
          path.node.properties.push(
              j.objectProperty(
                  j.identifier('type'),
                  j.stringLiteral('asset/resource'),
              ),
          );
          dirtyFlag = true;
      }
  });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';
